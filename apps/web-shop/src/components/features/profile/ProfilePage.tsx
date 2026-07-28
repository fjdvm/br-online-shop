"use client";

import { useProfilePage } from "@/hooks/useProfilePage";
import { ProfileSidebar } from "./ProfileSidebar";
import { ProfilePersonalTab } from "./ProfilePersonalTab";
import { ProfileAddressesTab } from "./ProfileAddressesTab";
import { ProfileOrdersTab } from "./ProfileOrdersTab";
import { AddressModal } from "@/components/features/profile/AddressModal";

export function ProfilePage() {
  const {
    activeTab,
    setActiveTab,
    user,
    addresses,
    isLoadingUser,
    isAddressModalOpen,
    setIsAddressModalOpen,
    editingAddress,
    isSavingAddress,
    profileForm,
    profileSuccessMessage,
    profileErrorMessage,
    onProfileSubmit,
    handleOpenAddAddress,
    handleEditAddress,
    handleSaveAddress,
    handleDeleteAddress,
  } = useProfilePage();

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-10 py-12 space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-2 border-b border-border/40 pb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
          Account Settings
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground font-medium">
          Manage your profile, addresses, and track your artisan ube halaya orders.
        </p>
      </div>

      {/* Profile Layout: Side Tabs + Main Content (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <aside className="md:col-span-3">
          <ProfileSidebar activeTab={activeTab} onTabChange={setActiveTab} user={user} />
        </aside>

        <main className="md:col-span-9 bg-surface-card border border-border/30 rounded-md p-6 md:p-8 shadow-sm max-h-[750px] overflow-y-auto">
          {isLoadingUser ? (
            <div className="p-12 text-center text-xs text-muted-foreground font-medium">
              Loading account information...
            </div>
          ) : (
            <>
              {activeTab === "personal" && (
                <ProfilePersonalTab
                  user={user}
                  form={profileForm}
                  onSubmit={onProfileSubmit}
                  successMessage={profileSuccessMessage}
                  errorMessage={profileErrorMessage}
                />
              )}

              {activeTab === "addresses" && (
                <ProfileAddressesTab
                  addresses={addresses}
                  onAddNew={handleOpenAddAddress}
                  onEdit={handleEditAddress}
                  onDelete={handleDeleteAddress}
                />
              )}

              {activeTab === "orders" && <ProfileOrdersTab />}
            </>
          )}
        </main>
      </div>

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSubmit={handleSaveAddress}
        initialData={editingAddress}
        isLoading={isSavingAddress}
      />
    </div>
  );
}
