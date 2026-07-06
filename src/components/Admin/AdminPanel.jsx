import { useEffect, useState } from "react";
import { collection, getCountFromServer } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useAppConfig } from "../../hooks/useAppConfig";
import { Card, ResultTile } from "../common/Card";

export default function AdminPanel() {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const { maintenanceMode, setMaintenanceMode } = useAppConfig();
  const [userCount, setUserCount] = useState(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!isAdmin || !isFirebaseConfigured) return;
    // Requires the isAdmin() read rule on /users in firestore.rules — a
    // regular user's rules would reject this count.
    getCountFromServer(collection(db, "users"))
      .then((snap) => setUserCount(snap.data().count))
      .catch(() => setUserCount(null));
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <Card title={t("nav.admin")}>
        <p className="text-lotus text-sm">{t("admin.notAuthorized")}</p>
      </Card>
    );
  }

  const handleToggle = async () => {
    setToggling(true);
    await setMaintenanceMode(!maintenanceMode);
    setToggling(false);
  };

  return (
    <div className="space-y-6">
      <Card title={t("nav.admin")} subtitle="Finma — app maintenance & controls">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <ResultTile
            label={t("admin.totalUsers")}
            value={userCount === null ? "—" : userCount.toLocaleString()}
            tone="indigo"
          />
          <ResultTile
            label={t("admin.maintenanceMode")}
            value={maintenanceMode ? t("common.on") : t("common.off")}
            tone={maintenanceMode ? "lotus" : "bamboo"}
          />
        </div>

        <div className="stitch-divider mb-4" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display font-semibold text-ink mb-1">{t("admin.maintenanceMode")}</h3>
            <p className="text-sm text-ink/60 max-w-md">{t("admin.maintenanceModeDesc")}</p>
          </div>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={maintenanceMode ? "btn-secondary text-sm shrink-0" : "btn-primary text-sm shrink-0"}
          >
            {maintenanceMode ? t("admin.disableMaintenance") : t("admin.enableMaintenance")}
          </button>
        </div>
      </Card>
    </div>
  );
}
