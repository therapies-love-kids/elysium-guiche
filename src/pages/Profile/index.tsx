import React from "react";
import { useParams, Navigate } from "react-router-dom";
import Admin from "./admin";
import Medic from "./medic";


const profileComponents: { [key: string]: React.ComponentType } = {
  admin: Admin,
  medic: Medic
};

function Profile() {
  const { profileType } = useParams(); // Pega o valor de :profileType da URL

  // Verifica se o perfil existe
  const ProfileComponent = profileType ? profileComponents[profileType.toLowerCase()] : null;

  if (!ProfileComponent) {
    // Redireciona para uma página de erro ou de volta ao login se o perfil não existir
    return <Navigate to="/" replace />;
  }

  return <ProfileComponent />;
}

export default Profile;