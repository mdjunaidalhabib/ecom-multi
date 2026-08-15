"use client";
import React from "react";


function cn(...classes) {
return classes.filter(Boolean).join(" ");
}


export function Card({ className, ...props }) {
return (
<div
className={cn(
"rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm",
"transition-shadow hover:shadow-md",
className
)}
{...props}
/>
);
}


export function CardHeader({ className, ...props }) {
return <div className={cn("p-5 pb-3", className)} {...props} />;
}


export function CardTitle({ className, ...props }) {
return <h3 className={cn("text-lg font-semibold tracking-tight text-gray-900 dark:text-slate-100", className)} {...props} />;
}


export function CardDescription({ className, ...props }) {
return <p className={cn("text-sm text-gray-500 dark:text-slate-400", className)} {...props} />;
}


export function CardContent({ className, ...props }) {
return <div className={cn("p-5 pt-0", className)} {...props} />;
}


export function CardFooter({ className, ...props }) {
return (
<div className={cn("p-5 pt-0 flex items-center justify-end gap-2", className)} {...props} />
);
}


export default Card;