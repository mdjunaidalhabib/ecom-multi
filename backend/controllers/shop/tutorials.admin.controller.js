import Tutorial from "../../src/models/Tutorial.js";
import { TUTORIAL_SECTIONS } from "../../src/constants/tutorialSections.js";
import { extractYouTubeId } from "../../src/utils/youtube.js";

function parseBody(body = {}, { partial = false } = {}) {
  const data = {};

  if (!partial || body.title !== undefined) {
    const title = String(body.title ?? "").trim();
    if (!title) throw new Error("টিউটোরিয়ালের শিরোনাম প্রয়োজন");
    data.title = title.slice(0, 120);
  }

  if (body.description !== undefined) {
    data.description = String(body.description).trim().slice(0, 600);
  }

  if (body.section !== undefined) {
    if (!TUTORIAL_SECTIONS.includes(body.section)) {
      throw new Error("অবৈধ সেকশন");
    }
    data.section = body.section;
  }

  if (!partial || body.youtubeUrl !== undefined) {
    const youtubeUrl = String(body.youtubeUrl ?? "").trim();
    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) throw new Error("সঠিক YouTube লিংক দিন");
    data.youtubeUrl = youtubeUrl;
    data.videoId = videoId;
  }

  if (body.isPublished !== undefined) {
    data.isPublished = !!body.isPublished;
  }

  return data;
}

// ✅ body.sortOrder এখানে "কাঙ্ক্ষিত পজিশন" (১ = সবার আগে) — সরাসরি ডাটাবেসে
// বসে না, নিচের reorderTutorials দিয়ে বাকিদের সাথে অ্যাডজাস্ট হয়। ভ্যালিড
// সংখ্যা না হলে null (মানে: পজিশন বদলানোর অনুরোধ নেই)।
function parsePosition(body = {}) {
  if (body.sortOrder === undefined || body.sortOrder === "") return null;
  const n = Number(body.sortOrder);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

// ✅ সব টিউটোরিয়ালকে ১, ২, ৩… ক্রমে সাজায়। movedId + position দিলে সেই
// ভিডিওটাকে ওই পজিশনে বসিয়ে বাকিদের এক ধাপ করে সরিয়ে দেয়; movedId ছাড়া
// শুধু ফাঁক/ডুপ্লিকেট ঠিক করে (ডিলিটের পরে)। যাদের নম্বর বদলায় শুধু তাদেরই লেখা হয়।
async function reorderTutorials(movedId = null, position = null) {
  const docs = await Tutorial.find()
    .sort({ sortOrder: 1, createdAt: 1 })
    .select("_id sortOrder")
    .lean();

  const ids = docs.map((d) => String(d._id));
  if (movedId && position !== null) {
    const from = ids.indexOf(String(movedId));
    if (from !== -1) ids.splice(from, 1);
    const at = Math.min(Math.max(position - 1, 0), ids.length);
    ids.splice(at, 0, String(movedId));
  }

  const current = new Map(docs.map((d) => [String(d._id), d.sortOrder]));
  const ops = [];
  ids.forEach((id, i) => {
    if (current.get(id) !== i + 1) {
      ops.push({ updateOne: { filter: { _id: id }, update: { sortOrder: i + 1 } } });
    }
  });
  if (ops.length) await Tutorial.bulkWrite(ops);
}

/* -------------------------------------------------------
   GET /admin/tutorials — যেকোনো লগইন করা admin/staff পড়তে পারে।
   super-admin সব (draft সহ) দেখে, বাকিরা শুধু published।
------------------------------------------------------- */
export const listTutorials = async (req, res) => {
  try {
    const filter = req.admin?.role === "superadmin" ? {} : { isPublished: true };
    const tutorials = await Tutorial.find(filter)
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();
    return res.json(tutorials);
  } catch (err) {
    console.error("listTutorials error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------------
   POST /admin/tutorials — super-admin only
------------------------------------------------------- */
export const createTutorial = async (req, res) => {
  try {
    let data;
    try {
      data = parseBody(req.body);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
    // ডিফল্টে শেষে যোগ হয়; পজিশন দিলে সেখানে বসে বাকিরা সরে যায়
    data.sortOrder = (await Tutorial.countDocuments()) + 1;
    const tutorial = await Tutorial.create(data);

    const position = parsePosition(req.body);
    if (position !== null && position !== data.sortOrder) {
      await reorderTutorials(tutorial._id, position);
    }

    const saved = await Tutorial.findById(tutorial._id);
    return res.status(201).json(saved);
  } catch (err) {
    console.error("createTutorial error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------------
   PATCH /admin/tutorials/:id — super-admin only
------------------------------------------------------- */
export const updateTutorial = async (req, res) => {
  try {
    let data;
    try {
      data = parseBody(req.body, { partial: true });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
    const tutorial = await Tutorial.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!tutorial) return res.status(404).json({ message: "Tutorial not found" });

    const position = parsePosition(req.body);
    if (position !== null) {
      await reorderTutorials(tutorial._id, position);
    }

    return res.json(await Tutorial.findById(tutorial._id));
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(404).json({ message: "Tutorial not found" });
    }
    console.error("updateTutorial error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------------
   DELETE /admin/tutorials/:id — super-admin only
------------------------------------------------------- */
export const deleteTutorial = async (req, res) => {
  try {
    const tutorial = await Tutorial.findByIdAndDelete(req.params.id);
    if (!tutorial) return res.status(404).json({ message: "Tutorial not found" });
    await reorderTutorials(); // ফাঁকা পজিশন বন্ধ করে বাকিদের এগিয়ে আনে
    return res.json({ message: "টিউটোরিয়াল ডিলিট হয়েছে" });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(404).json({ message: "Tutorial not found" });
    }
    console.error("deleteTutorial error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
