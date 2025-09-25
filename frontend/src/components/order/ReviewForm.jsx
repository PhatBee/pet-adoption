// src/components/ReviewForm.jsx
import React, { useState, useEffect } from "react";

export default function ReviewForm({ initial, onSubmit, disabled }) {
  const [rating, setRating] = useState(initial?.rating || 5);
  const [comment, setComment] = useState(initial?.comment || "");

  useEffect(() => { setRating(initial?.rating || 5); setComment(initial?.comment || ""); }, [initial]);

  const submit = (e) => {
    e.preventDefault();
    onSubmit({ rating, comment });
  };

  return (
    <form onSubmit={submit} className="mt-2">
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map(n => (
          <button key={n} type="button" onClick={()=>setRating(n)} className={`px-2 ${rating>=n?'text-yellow-500':'text-gray-300'}`}>★</button>
        ))}
      </div>
      <textarea value={comment} onChange={(e)=>setComment(e.target.value)} className="w-full border p-2 mt-2 rounded" rows={3} placeholder="Viết nhận xét..."></textarea>
      <div className="mt-2 flex gap-2">
        <button type="submit" disabled={disabled} className="bg-blue-600 text-white px-3 py-1 rounded">Lưu đánh giá</button>
        <button type="button" onClick={()=>{ setRating(initial?.rating||5); setComment(initial?.comment||""); }} className="border px-3 py-1 rounded">Hủy</button>
      </div>
    </form>
  );
}
