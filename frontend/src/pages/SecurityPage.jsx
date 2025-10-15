import React from 'react';
import ChangePasswordForm from '../components/user/ChangePasswordForm';
import DeleteAccount from '../components/user/DeleteAccount';

export default function SecurityPage() {
  return (
    <div>
      <ChangePasswordForm />

     <DeleteAccount />
    </div>
  );
}