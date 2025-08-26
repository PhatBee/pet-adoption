import React, { useEffect, useState } from "react";
import ProfileForm from "../components/ProfileForm";
import { toast } from "react-toastify";
import { getProfileApi, updateProfileApi } from "../api/authApi"; // dùng getProfileApi

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ fullName: "", avatarUrl: "" });

  // useEffect(() => {
  //   const fetchProfile = async () => {
  //     try {
  //       const data = await getProfileApi();

  //       setProfile(data.user || data);
  //       setForm({
  //         fullName: data.user?.fullName || data.fullName || "",
  //         avatarUrl: data.user?.avatarUrl || data.avatarUrl || "",
  //       });
  //     } catch (err) {
  //       toast.error("Failed to load profile");
  //     }
  //   };
  //   fetchProfile();
  // }, []);

  // const handleUpdate = async () => {
  //   try {
  //     const data = await updateProfileApi(form);
  //     setProfile(data.user || data);
  //     toast.success("Profile updated!");
  //   } catch (err) {
  //     toast.error("Update failed");
  //   }
  // };

  return (
    // <ProfileForm
    //   profile={profile}
    //   form={form}
    //   setForm={setForm}
    //   onUpdate={handleUpdate}
    // />
    <div className="container mt-4">
      <ProfileForm />
    </div>
  );
};

export default ProfilePage;
