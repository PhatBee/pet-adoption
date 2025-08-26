import React from "react";

const ProfileForm = ({ form, setForm, onUpdate, profile }) => {
  if (!profile) return <p className="text-center">Loading...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Profile</h1>
        <img
          src={profile.avatarUrl || "https://via.placeholder.com/100"}
          alt="avatar"
          className="w-24 h-24 rounded-full mx-auto mb-4"
        />
        <input
          type="text"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          placeholder="Full name"
          className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="text"
          value={form.avatarUrl}
          onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
          placeholder="Avatar URL"
          className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          onClick={onUpdate}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md transition"
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default ProfileForm;
