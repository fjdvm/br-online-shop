"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { userApi } from "@/lib/api/api-client";
import type { AddressDto } from "@/types/auth";
import type { ShippingAddressRequest } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Plus } from "lucide-react";
import { CharacterCount } from "@/components/shared/character-count";
import { trimField } from "@/lib/sanitize";
import {
  ADDRESS_FIELD_MAX,
  PHONE_MAX,
  NAME_REGEX,
  PH_MOBILE_REGEX,
  ADDRESS_REGEX,
  POSTAL_CODE_REGEX,
} from "@/lib/validators/auth";

interface ShippingStepProps {
  initialAddress: ShippingAddressRequest | null;
  onNext: (address: ShippingAddressRequest) => void;
}

interface ShippingFieldErrors {
  recipientName?: string;
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  phone?: string;
}

function validateShippingFields(fields: {
  recipientName: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
}): ShippingFieldErrors {
  const errors: ShippingFieldErrors = {};

  if (!fields.recipientName.trim()) {
    errors.recipientName = "Recipient name is required.";
  } else if (!NAME_REGEX.test(fields.recipientName.trim())) {
    errors.recipientName = "Can only contain letters, spaces, hyphens, and apostrophes.";
  }

  if (!fields.street.trim()) {
    errors.street = "Street address is required.";
  } else if (!ADDRESS_REGEX.test(fields.street.trim())) {
    errors.street = "Contains characters that are not allowed.";
  }

  if (!fields.city.trim()) {
    errors.city = "City is required.";
  } else if (!ADDRESS_REGEX.test(fields.city.trim())) {
    errors.city = "Contains characters that are not allowed.";
  }

  if (!fields.province.trim()) {
    errors.province = "Province is required.";
  } else if (!ADDRESS_REGEX.test(fields.province.trim())) {
    errors.province = "Contains characters that are not allowed.";
  }

  if (fields.postalCode.trim() && !POSTAL_CODE_REGEX.test(fields.postalCode.trim())) {
    errors.postalCode = "Contains characters that are not allowed.";
  }

  if (!fields.phone.trim()) {
    errors.phone = "Contact phone number is required.";
  } else if (!PH_MOBILE_REGEX.test(fields.phone.trim())) {
    errors.phone = "Enter a valid PH mobile number, e.g. 09171234567";
  }

  return errors;
}

export function ShippingStep({ initialAddress, onNext }: ShippingStepProps) {
  const { data: session } = useSession();
  const token = (session as { accessToken?: string })?.accessToken;

  const [savedAddresses, setSavedAddresses] = useState<AddressDto[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useCustomAddress, setUseCustomAddress] = useState(false);

  const [recipientName, setRecipientName] = useState(initialAddress?.recipientName || session?.user?.name || "");
  const [street, setStreet] = useState(initialAddress?.street || "");
  const [city, setCity] = useState(initialAddress?.city || "");
  const [province, setProvince] = useState(initialAddress?.province || "");
  const [postalCode, setPostalCode] = useState(initialAddress?.postalCode || "");
  const [phone, setPhone] = useState(initialAddress?.phone || "");
  const [fieldErrors, setFieldErrors] = useState<ShippingFieldErrors>({});

  useEffect(() => {
    if (token) {
      userApi.getAddresses(token).then((res) => {
        setSavedAddresses(res);
        const defaultAddr = res.find((a) => a.isDefault) || res[0];
        if (defaultAddr && !initialAddress) {
          setSelectedAddressId(defaultAddr.id);
          setRecipientName(session?.user?.name || "");
          setStreet(defaultAddr.street);
          setCity(defaultAddr.city);
          setProvince(defaultAddr.province);
          setPostalCode(defaultAddr.postalCode);
        }
      }).catch(() => {});
    }
  }, [token, session, initialAddress]);

  const handleSelectSaved = (addr: AddressDto) => {
    setSelectedAddressId(addr.id);
    setUseCustomAddress(false);
    setStreet(addr.street);
    setCity(addr.city);
    setProvince(addr.province);
    setPostalCode(addr.postalCode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateShippingFields({ recipientName, street, city, province, postalCode, phone });
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    onNext({
      recipientName: trimField(recipientName),
      street: trimField(street),
      city: trimField(city),
      province: trimField(province),
      postalCode: trimField(postalCode),
      phone: trimField(phone),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="font-serif text-xl font-bold text-primary flex items-center gap-2 border-b border-outline-variant/20 pb-3">
        <MapPin className="w-5 h-5 text-primary" />
        Shipping Address
      </h2>

      {savedAddresses.length > 0 && (
        <div className="space-y-3">
          <Label className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Saved Addresses
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedAddresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id && !useCustomAddress;
              return (
                <div
                  key={addr.id}
                  onClick={() => handleSelectSaved(addr)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                      : "border-outline-variant/30 hover:border-primary/40 bg-surface-container-lowest"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-sans font-bold text-xs text-on-surface uppercase">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="text-[10px] bg-secondary-container text-on-secondary-container font-bold px-2 py-0.5">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-xs text-on-surface font-medium truncate">{addr.street}</p>
                  <p className="font-sans text-xs text-on-surface-variant">
                    {addr.city}, {addr.province} {addr.postalCode}
                  </p>
                </div>
              );
            })}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setUseCustomAddress(true);
              setSelectedAddressId(null);
            }}
            className="text-xs font-semibold gap-1.5 border-dashed border-outline-variant/50 hover:bg-surface-container"
          >
            <Plus className="w-4 h-4" />
            Enter Custom Address
          </Button>
        </div>
      )}

      <div className="space-y-4 pt-2 border-t border-outline-variant/30 font-sans">
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="recipientName" className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Recipient Full Name *
            </Label>
            <CharacterCount value={recipientName} max={ADDRESS_FIELD_MAX} />
          </div>
          <Input
            id="recipientName"
            value={recipientName}
            onChange={(e) => {
              setRecipientName(e.target.value);
              setFieldErrors((prev) => ({ ...prev, recipientName: undefined }));
            }}
            placeholder="e.g. Bren Raphael"
            maxLength={ADDRESS_FIELD_MAX}
            aria-invalid={!!fieldErrors.recipientName}
            className={`mt-1.5 px-5 py-3 bg-surface-container-lowest border-outline-variant/40 focus:border-primary ${fieldErrors.recipientName ? "border-destructive" : ""}`}
            required
          />
          {fieldErrors.recipientName && <p className="mt-1 text-xs text-destructive">{fieldErrors.recipientName}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="street" className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Street Address *
            </Label>
            <CharacterCount value={street} max={ADDRESS_FIELD_MAX} />
          </div>
          <Input
            id="street"
            value={street}
            onChange={(e) => {
              setStreet(e.target.value);
              setFieldErrors((prev) => ({ ...prev, street: undefined }));
            }}
            placeholder="House/Unit #, Street name"
            maxLength={ADDRESS_FIELD_MAX}
            aria-invalid={!!fieldErrors.street}
            className={`mt-1.5 px-5 py-3 bg-surface-container-lowest border-outline-variant/40 focus:border-primary ${fieldErrors.street ? "border-destructive" : ""}`}
            required
          />
          {fieldErrors.street && <p className="mt-1 text-xs text-destructive">{fieldErrors.street}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="city" className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                City / Municipality *
              </Label>
              <CharacterCount value={city} max={ADDRESS_FIELD_MAX} />
            </div>
            <Input
              id="city"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setFieldErrors((prev) => ({ ...prev, city: undefined }));
              }}
              placeholder="e.g. Baguio City"
              maxLength={ADDRESS_FIELD_MAX}
              aria-invalid={!!fieldErrors.city}
              className={`mt-1.5 px-5 py-3 bg-surface-container-lowest border-outline-variant/40 focus:border-primary ${fieldErrors.city ? "border-destructive" : ""}`}
              required
            />
            {fieldErrors.city && <p className="mt-1 text-xs text-destructive">{fieldErrors.city}</p>}
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="province" className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Province *
              </Label>
              <CharacterCount value={province} max={ADDRESS_FIELD_MAX} />
            </div>
            <Input
              id="province"
              value={province}
              onChange={(e) => {
                setProvince(e.target.value);
                setFieldErrors((prev) => ({ ...prev, province: undefined }));
              }}
              placeholder="e.g. Benguet"
              maxLength={ADDRESS_FIELD_MAX}
              aria-invalid={!!fieldErrors.province}
              className={`mt-1.5 px-5 py-3 bg-surface-container-lowest border-outline-variant/40 focus:border-primary ${fieldErrors.province ? "border-destructive" : ""}`}
              required
            />
            {fieldErrors.province && <p className="mt-1 text-xs text-destructive">{fieldErrors.province}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="postalCode" className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Postal Code
              </Label>
              <CharacterCount value={postalCode} max={ADDRESS_FIELD_MAX} />
            </div>
            <Input
              id="postalCode"
              value={postalCode}
              onChange={(e) => {
                setPostalCode(e.target.value);
                setFieldErrors((prev) => ({ ...prev, postalCode: undefined }));
              }}
              placeholder="e.g. 2600"
              maxLength={ADDRESS_FIELD_MAX}
              aria-invalid={!!fieldErrors.postalCode}
              className={`mt-1.5 px-5 py-3 bg-surface-container-lowest border-outline-variant/40 focus:border-primary ${fieldErrors.postalCode ? "border-destructive" : ""}`}
            />
            {fieldErrors.postalCode && <p className="mt-1 text-xs text-destructive">{fieldErrors.postalCode}</p>}
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="phone" className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Contact Phone Number *
              </Label>
              <CharacterCount value={phone} max={PHONE_MAX} />
            </div>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setFieldErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              placeholder="0917XXXXXXX"
              maxLength={PHONE_MAX}
              aria-invalid={!!fieldErrors.phone}
              className={`mt-1.5 px-5 py-3 bg-surface-container-lowest border-outline-variant/40 focus:border-primary ${fieldErrors.phone ? "border-destructive" : ""}`}
              required
            />
            {fieldErrors.phone && <p className="mt-1 text-xs text-destructive">{fieldErrors.phone}</p>}
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" className="rounded-xl px-8 py-3 bg-primary text-white font-semibold hover:bg-primary-container shadow-sm">
          Continue to Order Review
        </Button>
      </div>
    </form>
  );
}
