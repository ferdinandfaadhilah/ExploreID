
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./context/AuthContext";
import ImageCropper from "./ImageCropper";
import "./ProfilePage.css";

import {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  type UserProfile,
} from "./lib/profileService";

type ProfilePageProps = {
  onLogout: () => void;
};

export default function ProfilePage({ onLogout }: ProfilePageProps) {  const { user } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [cropImage, setCropImage] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

// Mengambil data profil dari Supabase
useEffect(() => {
  if (!user) {
    setLoading(false);
    return;
  }

  let active = true;

  async function loadProfile() {
    try {
      setLoading(true);

      const data = await getUserProfile(user!);

      if (!active) return;

      setProfile(data);
      setDisplayName(data.display_name || "");
      setUsername(data.username || "");
      setBio(data.bio || "");
    } catch (err) {
      console.error("Gagal mengambil profil:", err);

      if (active) {
        const errorMessage =
          err instanceof Error ? err.message : String(err);

        setError(`Gagal memuat profil: ${errorMessage}`);
      }
    } finally {
      if (active) {
        setLoading(false);
      }
    }
  }

  loadProfile();

  return () => {
    active = false;
  };
}, [user]);

  // Membuat preview foto hasil crop
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  // Membersihkan URL sementara editor crop
  useEffect(() => {
    return () => {
      if (cropImage) {
        URL.revokeObjectURL(cropImage);
      }
    };
  }, [cropImage]);

  // Memilih foto profil
  function handlePhotoChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    if (!file.type.startsWith("image/")) {
      setError("Pilih file gambar, bro.");
      event.target.value = "";
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError("Ukuran foto maksimal 3 MB.");
      event.target.value = "";
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setCropImage(imageUrl);
  }

  // Menyimpan hasil crop sebagai File
  async function handleCropSave(croppedImage: string) {
    try {
      const response = await fetch(croppedImage);
      const blob = await response.blob();

      const croppedFile = new File(
        [blob],
        "profile-avatar.jpg",
        { type: "image/jpeg" }
      );

      setSelectedFile(croppedFile);
      setCropImage("");
      setError("");
      setMessage("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Gagal memproses foto:", err);
      setError("Gagal memproses foto. Silakan coba lagi.");
    }
  }

  // Membatalkan crop
  function handleCropCancel() {
    setCropImage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

 // Menyimpan perubahan profil ke Supabase
async function handleSave() {
  if (!user) return;

  if (!displayName.trim()) {
    setError("Nama tampilan tidak boleh kosong.");
    return;
  }

  setSaving(true);
  setError("");
  setMessage("");

  try {
    let avatarUrl = profile?.avatar_url || null;

    if (selectedFile) {
      avatarUrl = await uploadAvatar(user.id, selectedFile);
    }

    const updatedProfile = await updateUserProfile(user.id, {
      display_name: displayName.trim(),
      username: username.trim() || null,
      bio: bio.trim(),
      avatar_url: avatarUrl,
    });

    setProfile(updatedProfile);
    setSelectedFile(null);
    setMessage("Profil berhasil disimpan!");
  } catch (err) {
    console.error("Gagal menyimpan profil:", err);

    if (err && typeof err === "object" && "message" in err) {
      setError(String(err.message));
    } else {
      setError(JSON.stringify(err));
    }
  } finally {
    setSaving(false);
  }
}

  // Membatalkan perubahan profil
  function handleCancel() {
    if (!profile) return;

    setDisplayName(profile.display_name || "");
    setUsername(profile.username || "");
    setBio(profile.bio || "");
    setSelectedFile(null);
    setCropImage("");
    setError("");
    setMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  if (!user) {
    return (
      <main className="profile-page">
        <div className="profile-settings-card">
          <h2>Login diperlukan</h2>
          <p>Silakan login untuk melihat profil ExploreID.</p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-settings-card">
          <p>Memuat profil...</p>
        </div>
      </main>
    );
  }

  const avatarSource = previewUrl || profile?.avatar_url;

  const initials = (displayName || user.email || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

  return (
    <>
      <main className="profile-page">
        <div className="profile-settings-card">
          <div className="profile-cover" />

          <div className="profile-identity">
            <div className="profile-avatar-wrapper">
              {avatarSource ? (
                <img
                  src={avatarSource}
                  alt="Foto profil"
                  className="profile-avatar-image"
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  {initials}
                </div>
              )}
            </div>

            <button
              type="button"
              className="profile-view-button"
              onClick={() => fileInputRef.current?.click()}
            >
              Change photo
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handlePhotoChange}
            />
          </div>

          <div className="profile-heading">
            <h1>{displayName || "Your Profile"}</h1>
            <p>{user.email}</p>
            <span>ExploreID Member</span>
          </div>

          <div className="profile-divider" />

          <section className="profile-form-section">
            <div className="profile-section-description">
              <h2>Public Profile</h2>
              <p>
                Atur informasi yang digunakan untuk mengenali akun
                ExploreID kamu.
              </p>
            </div>

            <div className="profile-fields">
              <label>
                Display name
                <input
                  type="text"
                  value={displayName}
                  onChange={(event) =>
                    setDisplayName(event.target.value)
                  }
                  placeholder="Nama tampilan"
                  maxLength={60}
                />
              </label>

              <label>
                Username
                <div className="profile-username-input">
                  <span>exploreid.com/</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(event) =>
                      setUsername(
                        event.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9_]/g, "")
                      )
                    }
                    placeholder="username"
                    maxLength={30}
                  />
                </div>
              </label>

              <label>
                Bio
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="Ceritakan sedikit tentang dirimu..."
                  rows={3}
                  maxLength={160}
                />
              </label>

              <p className="profile-photo-hint">
                Format foto mengikuti gambar yang didukung browser.
                Maksimal ukuran file 3 MB.
              </p>
            </div>
          </section>

          <div className="profile-divider" />

          <section className="profile-form-section">
            <div className="profile-section-description">
              <h2>Account Information</h2>
              <p>Informasi dasar akun ExploreID kamu.</p>
            </div>

            <div className="profile-fields">
              <label>
                Email address
                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                />
              </label>

              <label>
                Account created
                <input
                  type="text"
                  value={new Date(user.created_at).toLocaleDateString(
                    "id-ID",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                  disabled
                />
              </label>
            </div>
          </section>

          {error && (
            <p className="profile-message profile-error">
              {error}
            </p>
          )}

          {message && (
            <p className="profile-message profile-success">
              {message}
            </p>
          )}

          <div className="profile-footer">
            <button
              type="button"
              className="profile-cancel-button"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="button"
              className="profile-save-button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
          <div className="profile-logout-section">
  <button
    type="button"
    className="profile-logout-button"
    onClick={onLogout}
    disabled={saving}
  >
    Log Out
  </button>
</div>
        </div>
      </main>

      {cropImage && (
        <ImageCropper
          image={cropImage}
          onCancel={handleCropCancel}
          onSave={handleCropSave}
        />
      )}
    </>
  );
}
