import { useState, type ReactNode } from "react";
import type { Destination } from "../data/destinations";
import { useLanguage } from "../hooks/useLanguage";
import { usePersistedBoolean } from "../hooks/usePersistedBoolean";
import type { AppearanceTheme } from "../hooks/useAppearance";
import type { Language } from "../i18n/translations";
import { getUserDisplayName, type AppUser } from "../types";

type SettingsCategory =
  | "Account & Profile"
  | "Favorites"
  | "Notifications"
  | "Language & Region"
  | "Privacy"
  | "Appearance"
  | "About";

type SettingsPageProps = {
  user: AppUser | null | undefined;
  profileAvatar: string | null;
  accountInitials: string;
  favoriteDestinations: Destination[];
  renderCard: (item: Destination) => ReactNode;
  personalizedContent: boolean;
  onPersonalizedContentChange: (value: boolean) => void;
  appearanceTheme: AppearanceTheme;
  onAppearanceChange: (theme: AppearanceTheme) => void;
  onNavigate: (page: "login" | "profile") => void;
};

type ToggleRowProps = {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
};

function ToggleRow({ title, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="settings-option-row">
      <div className="settings-option-info">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <label className="settings-switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="settings-switch-slider"></span>
      </label>
    </div>
  );
}

export default function SettingsPage({
  user,
  profileAvatar,
  accountInitials,
  favoriteDestinations,
  renderCard,
  personalizedContent,
  onPersonalizedContentChange,
  appearanceTheme,
  onAppearanceChange,
  onNavigate,
}: SettingsPageProps) {
  const { t, language, setLanguage } = useLanguage();
  const s = t.settings;

  const [category, setCategory] =
    useState<SettingsCategory>("Account & Profile");

  const [emailNotifications, setEmailNotifications] = usePersistedBoolean(
    "exploreid-email-notifications",
    true
  );
  const [recommendationNotifications, setRecommendationNotifications] =
    usePersistedBoolean("exploreid-recommendation-notifications", true);
  const [updateNotifications, setUpdateNotifications] = usePersistedBoolean(
    "exploreid-update-notifications",
    false
  );
  const [privateProfile, setPrivateProfile] = usePersistedBoolean(
    "exploreid-private-profile",
    true
  );
  const [activitySharing, setActivitySharing] = usePersistedBoolean(
    "exploreid-activity-sharing",
    false
  );

  const categories: { id: SettingsCategory; label: string; count?: number }[] =
    [
      { id: "Account & Profile", label: s.account },
      {
        id: "Favorites",
        label: s.favorites,
        count: favoriteDestinations.length,
      },
      { id: "Notifications", label: s.notifications },
      { id: "Language & Region", label: s.language },
      { id: "Privacy", label: s.privacy },
      { id: "Appearance", label: s.appearance },
      { id: "About", label: s.about },
    ];

  const appearanceOptions: {
    id: AppearanceTheme;
    icon: string;
    title: string;
    description: string;
  }[] = [
    { id: "light", icon: "☀", title: s.lightMode, description: s.lightModeDesc },
    { id: "dark", icon: "☾", title: s.darkMode, description: s.darkModeDesc },
    {
      id: "system",
      icon: "▣",
      title: s.systemMode,
      description: s.systemModeDesc,
    },
  ];

  const profileName = getUserDisplayName(user);
  const hasFullName = Boolean(
    typeof user?.user_metadata?.full_name === "string" &&
      user.user_metadata.full_name
  );

  return (
    <section className="inner-page settings-page">
      <span className="eyebrow">{s.preferences}</span>

      <h1 className="page-title">{s.title}</h1>

      <p className="page-subtitle">{s.subtitle}</p>

      <div className="settings-layout">
        {/* SIDEBAR */}
        <aside className="settings-sidebar">
          {categories.map((item) => (
            <button
              key={item.id}
              className={`settings-category ${
                category === item.id ? "active" : ""
              }`}
              onClick={() => setCategory(item.id)}
            >
              {item.label}

              {item.count !== undefined && (
                <span className="settings-category-count">{item.count}</span>
              )}
            </button>
          ))}
        </aside>

        {/* CONTENT */}
        <div className="settings-content">
          {/* ACCOUNT & PROFILE */}
          {category === "Account & Profile" && (
            <div className="settings-account">
              {!user ? (
                <div className="settings-login-required">
                  <div className="settings-login-icon">
                    <span>🔒</span>
                  </div>

                  <h2>{s.loginRequiredTitle}</h2>

                  <p>{s.loginRequiredDesc}</p>

                  <button
                    className="settings-login-button"
                    onClick={() => onNavigate("login")}
                  >
                    {s.loginNow}
                  </button>
                </div>
              ) : (
                <>
                  <h2>{s.profileInfo}</h2>

                  <p className="settings-description">{s.profileDesc}</p>

                  <div className="settings-profile-card">
                    <div className="settings-profile-avatar">
                      {profileAvatar ? (
                        <img src={profileAvatar} alt={t.nav.profilePhotoAlt} />
                      ) : (
                        accountInitials
                      )}
                    </div>

                    <div className="settings-profile-info">
                      <h3>{hasFullName ? profileName : s.defaultUserName}</h3>
                      <p>{user.email || s.noEmail}</p>
                    </div>
                  </div>

                  <div className="settings-info-row">
                    <span>{s.accountEmail}</span>
                    <strong>{user.email || "-"}</strong>
                  </div>

                  <div className="settings-info-row">
                    <span>{s.profileName}</span>
                    <strong>{hasFullName ? profileName : s.notSet}</strong>
                  </div>

                  <button
                    className="settings-edit-button"
                    onClick={() => onNavigate("profile")}
                  >
                    {s.manageProfile}
                  </button>
                </>
              )}
            </div>
          )}

          {/* FAVORITES */}
          {category === "Favorites" && (
            <div className="settings-favorites">
              <h2>{s.favorites}</h2>

              <p className="settings-description">{s.favoritesDesc}</p>

              {favoriteDestinations.length === 0 ? (
                <div className="settings-empty-favorites">
                  <span>♡</span>
                  <h3>{s.emptyFavorites}</h3>
                  <p>{s.emptyFavoritesDesc}</p>
                </div>
              ) : (
                <div className="destination-grid">
                  {favoriteDestinations.map((item) => renderCard(item))}
                </div>
              )}
            </div>
          )}

          {/* NOTIFICATIONS */}
          {category === "Notifications" && (
            <div className="settings-notifications">
              <h2>{s.notificationTitle}</h2>

              <p className="settings-description">{s.notificationDesc}</p>

              <ToggleRow
                title={s.email}
                description={s.emailDesc}
                checked={emailNotifications}
                onChange={setEmailNotifications}
              />

              <ToggleRow
                title={s.recommendations}
                description={s.recommendationsDesc}
                checked={recommendationNotifications}
                onChange={setRecommendationNotifications}
              />

              <ToggleRow
                title={s.updates}
                description={s.updatesDesc}
                checked={updateNotifications}
                onChange={setUpdateNotifications}
              />
            </div>
          )}

          {/* LANGUAGE */}
          {category === "Language & Region" && (
            <div className="settings-language">
              <h2>{s.languageTitle}</h2>

              <p className="settings-description">{s.languageDesc}</p>

              <div className="settings-field">
                <label htmlFor="settings-language">{s.displayLanguage}</label>

                <select
                  id="settings-language"
                  value={language}
                  onChange={(event) =>
                    setLanguage(event.target.value as Language)
                  }
                >
                  <option value="English">English</option>
                  <option value="Indonesia">Bahasa Indonesia</option>
                </select>
              </div>
            </div>
          )}

          {/* PRIVACY */}
          {category === "Privacy" && (
            <div className="settings-privacy">
              <h2>{s.privacyTitle}</h2>

              <p className="settings-description">{s.privacyDesc}</p>

              <ToggleRow
                title={s.privateProfile}
                description={s.privateProfileDesc}
                checked={privateProfile}
                onChange={setPrivateProfile}
              />

              <ToggleRow
                title={s.activitySharing}
                description={s.activitySharingDesc}
                checked={activitySharing}
                onChange={setActivitySharing}
              />

              <ToggleRow
                title={s.personalized}
                description={s.personalizedDesc}
                checked={personalizedContent}
                onChange={onPersonalizedContentChange}
              />

              <p className="settings-description">{s.privacyNote}</p>
            </div>
          )}

          {/* APPEARANCE */}
          {category === "Appearance" && (
            <div className="settings-appearance">
              <h2>{s.appearanceTitle}</h2>

              <p className="settings-description">{s.appearanceDesc}</p>

              <div className="appearance-options">
                {appearanceOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`appearance-choice ${
                      appearanceTheme === option.id ? "active" : ""
                    }`}
                    aria-pressed={appearanceTheme === option.id}
                    onClick={() => onAppearanceChange(option.id)}
                  >
                    <span className="appearance-choice-icon">
                      {option.icon}
                    </span>

                    <span className="appearance-choice-text">
                      <strong>{option.title}</strong>
                      <small>{option.description}</small>
                    </span>

                    {appearanceTheme === option.id && (
                      <span className="appearance-check">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ABOUT */}
          {category === "About" && (
            <div className="settings-about">
              <h2>{s.aboutTitle}</h2>

              <p className="settings-description">{s.aboutDesc}</p>

              <div className="settings-info-row">
                <span>{s.version}</span>
                <strong>1.0.0</strong>
              </div>

              <div className="settings-info-row">
                <span>ExploreID</span>
                <strong>Indonesia</strong>
              </div>

              <p className="settings-description">{s.madeFor}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
