import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  propertyService,
  generatePropertySlug,
  PROPERTY_TYPE_DISPLAY_MAP,
  PROPERTY_TYPE_TO_CATEGORY_MAP,
  CATEGORY_TO_PROPERTY_TYPES_MAP,
} from '../../services/propertyService';
import { THANJAVUR_AREAS_OF_INTEREST } from '../../data/thanjavurAreas';
import { PropertyImageManager } from '../../components/admin/PropertyImageManager';
import type {
  PropertyRow,
  PropertyInsert,
  PropertyUpdate,
  PropertyCategoryDb,
  PropertyTypeDb,
  PropertyStatusDb,
  SizeUnitDb,
} from '../../types/database';
import {
  ArrowLeft,
  Building2,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface FormState {
  title: string;
  slug: string;
  description: string;
  category: PropertyCategoryDb;
  property_type: PropertyTypeDb | '';
  status: PropertyStatusDb;
  location: string;
  area_sector: string;
  plot_size_value: string;
  plot_size_unit: SizeUnitDb;
  building_size_value: string;
  room_configuration: string;
  number_of_toilets: string;
  borewell: 'YES' | 'NO' | 'UNSPECIFIED';
  total_price: string;
}

const INITIAL_FORM: FormState = {
  title: '',
  slug: '',
  description: '',
  category: 'RESIDENTIAL',
  property_type: 'HOUSE',
  status: 'DRAFT',
  location: 'Thanjavur',
  area_sector: '',
  plot_size_value: '',
  plot_size_unit: 'sq.ft',
  building_size_value: '',
  room_configuration: '2BHK',
  number_of_toilets: '',
  borewell: 'UNSPECIFIED',
  total_price: '',
};

export const PropertyForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [existingProperty, setExistingProperty] = useState<PropertyRow | null>(null);
  const [isLoadingProperty, setIsLoadingProperty] = useState<boolean>(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isUploadingImages, setIsUploadingImages] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [autoSlug, setAutoSlug] = useState<boolean>(!isEditMode);

  // Load existing property when editing
  useEffect(() => {
    const propertyId = id;
    if (!propertyId) return;

    let isMounted = true;
    propertyService
      .getPropertyById(propertyId)
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error || !data) {
          setErrorMessage(error || 'Property not found.');
          return;
        }

        setExistingProperty(data);
        setFormData({
          title: data.title,
          slug: data.slug,
          description: data.description || '',
          category: data.category,
          property_type: data.property_type || '',
          status: data.status,
          location: data.location,
          area_sector: data.area_sector,
          plot_size_value: data.plot_size_value ? String(data.plot_size_value) : '',
          plot_size_unit: data.plot_size_unit || 'sq.ft',
          building_size_value: data.building_size_value ? String(data.building_size_value) : '',
          room_configuration: data.room_configuration || '',
          number_of_toilets:
            data.number_of_toilets !== null && data.number_of_toilets !== undefined
              ? String(data.number_of_toilets)
              : '',
          borewell:
            data.borewell === true ? 'YES' : data.borewell === false ? 'NO' : 'UNSPECIFIED',
          total_price: data.total_price ? String(data.total_price) : '',
        });
        setAutoSlug(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setErrorMessage(err instanceof Error ? err.message : 'Failed to fetch property details.');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingProperty(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Handle title change and auto-slug generation
  const handleTitleChange = (newTitle: string) => {
    setFormData((prev) => ({
      ...prev,
      title: newTitle,
      slug: autoSlug ? generatePropertySlug(newTitle) : prev.slug,
    }));
  };

  const handleRegenerateSlug = () => {
    if (!formData.title.trim()) return;
    setFormData((prev) => ({
      ...prev,
      slug: generatePropertySlug(prev.title),
    }));
  };

  const handleCategoryChange = (newCat: PropertyCategoryDb) => {
    const compatibleTypes = CATEGORY_TO_PROPERTY_TYPES_MAP[newCat] || [];
    const isCurrentValid =
      formData.property_type &&
      compatibleTypes.includes(formData.property_type as PropertyTypeDb);

    setFormData((prev) => ({
      ...prev,
      category: newCat,
      property_type: isCurrentValid ? prev.property_type : (compatibleTypes[0] || ''),
    }));
  };

  const handlePropertyTypeChange = (newType: PropertyTypeDb | '') => {
    if (!newType) {
      setFormData((prev) => ({ ...prev, property_type: '' }));
      return;
    }
    const autoCategory = PROPERTY_TYPE_TO_CATEGORY_MAP[newType] || formData.category;
    setFormData((prev) => ({
      ...prev,
      property_type: newType,
      category: autoCategory,
    }));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Prevent duplicate submission while image upload is actively in progress
    if (isUploadingImages) {
      setErrorMessage('Please wait for image uploads to complete before saving property.');
      return;
    }

    // Basic Validations
    if (!formData.title.trim()) {
      setErrorMessage('Property title is required.');
      return;
    }

    if (!formData.property_type) {
      setErrorMessage('Property Type is mandatory. Please select a valid classification.');
      return;
    }

    const compatibleTypes = CATEGORY_TO_PROPERTY_TYPES_MAP[formData.category] || [];
    if (!compatibleTypes.includes(formData.property_type as PropertyTypeDb)) {
      setErrorMessage(
        `Selected Property Type (${formData.property_type}) is not compatible with category ${formData.category}.`
      );
      return;
    }

    if (!formData.location.trim()) {
      setErrorMessage('Location (City / District) is required.');
      return;
    }

    if (!formData.area_sector.trim()) {
      setErrorMessage('Area or Sector is required (e.g. Medical College Road).');
      return;
    }

    // Number validations
    const plotSizeNum = formData.plot_size_value.trim()
      ? parseFloat(formData.plot_size_value)
      : null;
    if (plotSizeNum !== null && (isNaN(plotSizeNum) || plotSizeNum <= 0)) {
      setErrorMessage('Plot size must be a positive number.');
      return;
    }

    const buildingSizeNum =
      formData.category !== 'LAND' && formData.building_size_value.trim()
        ? parseFloat(formData.building_size_value)
        : null;
    if (buildingSizeNum !== null && (isNaN(buildingSizeNum) || buildingSizeNum <= 0)) {
      setErrorMessage('Building size must be a positive number in sq.ft.');
      return;
    }

    const toiletsNum =
      formData.category !== 'LAND' && formData.number_of_toilets.trim()
        ? parseInt(formData.number_of_toilets, 10)
        : null;
    if (toiletsNum !== null && (isNaN(toiletsNum) || toiletsNum < 0)) {
      setErrorMessage('Number of toilets must be zero or a positive integer.');
      return;
    }

    const priceNum = formData.total_price.trim()
      ? parseInt(formData.total_price.replace(/,/g, ''), 10)
      : null;
    if (priceNum !== null && (isNaN(priceNum) || priceNum <= 0)) {
      setErrorMessage('Total price must be a positive integer in INR.');
      return;
    }

    // Borewell value mapping
    const borewellValue: boolean | null =
      formData.borewell === 'YES' ? true : formData.borewell === 'NO' ? false : null;

    // Room configuration mapping: Only applicable for RESIDENTIAL
    const roomConfigValue: string | null =
      formData.category === 'RESIDENTIAL' && formData.room_configuration.trim()
        ? formData.room_configuration.trim()
        : null;

    setIsSubmitting(true);

    try {
      if (isEditMode && id) {
        // UPDATE MODE
        const updatePayload: PropertyUpdate = {
          title: formData.title.trim(),
          slug: formData.slug.trim() || generatePropertySlug(formData.title),
          description: formData.description.trim() || null,
          category: formData.category,
          property_type: (formData.property_type as PropertyTypeDb) || null,
          status: formData.status,
          location: formData.location.trim(),
          area_sector: formData.area_sector.trim(),
          plot_size_value: plotSizeNum,
          plot_size_unit: plotSizeNum !== null ? formData.plot_size_unit : null,
          building_size_value: buildingSizeNum,
          building_size_unit: buildingSizeNum !== null ? 'sq.ft' : null,
          borewell: borewellValue,
          room_configuration: roomConfigValue,
          number_of_toilets: toiletsNum,
          total_price: priceNum,
        };

        const { data, error } = await propertyService.updateProperty(id, updatePayload);
        if (error || !data) {
          setErrorMessage(error || 'Failed to update property.');
        } else {
          setSuccessMessage('Property updated successfully.');
          setTimeout(() => navigate('/admin/properties'), 1000);
        }
      } else {
        // CREATE MODE
        if (!user?.id) {
          setErrorMessage('Authenticated user ID not found. Please log in again.');
          return;
        }

        const insertPayload: PropertyInsert = {
          title: formData.title.trim(),
          slug: formData.slug.trim() || generatePropertySlug(formData.title),
          description: formData.description.trim() || null,
          category: formData.category,
          property_type: formData.property_type as PropertyTypeDb,
          status: formData.status,
          location: formData.location.trim(),
          area_sector: formData.area_sector.trim(),
          plot_size_value: plotSizeNum,
          plot_size_unit: plotSizeNum !== null ? formData.plot_size_unit : null,
          building_size_value: buildingSizeNum,
          building_size_unit: buildingSizeNum !== null ? 'sq.ft' : null,
          borewell: borewellValue,
          room_configuration: roomConfigValue,
          number_of_toilets: toiletsNum,
          total_price: priceNum,
          created_by: user.id, // Strictly bind created_by to current authenticated admin
        };

        const { data, error } = await propertyService.createProperty(insertPayload);
        if (error || !data) {
          setErrorMessage(error || 'Failed to create property.');
        } else {
          setSuccessMessage('Property created successfully! Opening photo uploader...');
          setTimeout(() => navigate(`/admin/properties/${data.id}/edit`), 1000);
        }
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProperty) {
    return (
      <div className="bg-white border border-[#E5E1D8] p-16 text-center text-xs text-[#666666] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#C5A46D] animate-spin" />
        <span>Loading property details...</span>
      </div>
    );
  }

  const isLand = formData.category === 'LAND';
  const isResidential = formData.category === 'RESIDENTIAL';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/properties"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-[#142C38] hover:text-[#C5A46D] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Property Inventory</span>
        </Link>
        <span className="text-xs uppercase tracking-widest text-[#888888]">
          {isEditMode ? 'Edit Mode' : 'New Property Listing'}
        </span>
      </div>

      {/* Main Form Container */}
      <div className="bg-white border border-[#E5E1D8] p-6 sm:p-10 relative shadow-xs">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#142C38] via-[#C5A46D] to-[#142C38]" />

        {/* Header */}
        <div className="border-b border-[#E5E1D8] pb-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#142C38] text-[#C5A46D] flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif text-[#142C38] tracking-tight">
                {isEditMode ? `Edit Property: ${existingProperty?.title}` : 'Add New Property'}
              </h1>
              <p className="text-xs text-[#666666] mt-0.5">
                Configure verified property specifications for AMMAN REAL ESTATE
              </p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-6 p-4 bg-red-50 border-l-2 border-red-600 text-red-900 text-xs flex items-start gap-3"
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="mb-6 p-4 bg-emerald-50 border-l-2 border-emerald-600 text-emerald-900 text-xs flex items-start gap-3"
          >
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{successMessage} Redirecting...</p>
          </div>
        )}

        {/* Existing Property Unclassified Notice */}
        {isEditMode && existingProperty && !existingProperty.property_type && (
          <div
            role="alert"
            className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-900 text-xs flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Classification Required: Legacy Record</p>
              <p className="mt-0.5 text-amber-800 leading-relaxed font-light">
                This listing was created prior to the property type classification update and currently
                has no Property Type assigned. Please select a valid Property Type below before saving.
              </p>
            </div>
          </div>
        )}

        {/* Property Form */}
        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          {/* SECTION 1: CORE DETAILS */}
          <div>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-[#142C38] border-b border-[#E5E1D8] pb-2 mb-4 flex items-center gap-1.5">
              <span>1. Basic Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Title */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="prop-title"
                  className="block text-xs uppercase tracking-widest font-medium text-[#142C38] mb-1.5"
                >
                  Property Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="prop-title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. 3BHK Independent Luxury Villa on Medical College Road"
                  className="w-full px-3.5 py-2.5 bg-[#F7F5F0]/50 border border-[#E5E1D8] text-sm text-[#242424] placeholder:text-[#888888]/60 focus:bg-white focus:outline-none focus:border-[#C5A46D] rounded-none"
                  disabled={isSubmitting}
                />
              </div>

              {/* Slug */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="prop-slug"
                    className="block text-xs uppercase tracking-widest font-medium text-[#142C38]"
                  >
                    URL Slug <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleRegenerateSlug}
                    className="text-[11px] text-[#C5A46D] hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Regenerate from Title</span>
                  </button>
                </div>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-[#E5E1D8]/50 border border-r-0 border-[#E5E1D8] text-xs text-[#666666] font-mono">
                    /properties/
                  </span>
                  <input
                    id="prop-slug"
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => {
                      setAutoSlug(false);
                      setFormData({ ...formData, slug: e.target.value });
                    }}
                    placeholder="3bhk-independent-luxury-villa"
                    className="w-full px-3.5 py-2.5 bg-[#F7F5F0]/50 border border-[#E5E1D8] text-xs font-mono text-[#242424] focus:bg-white focus:outline-none focus:border-[#C5A46D] rounded-none"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="prop-category"
                  className="block text-xs uppercase tracking-widest font-medium text-[#142C38] mb-1.5"
                >
                  Property Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="prop-category"
                  value={formData.category}
                  onChange={(e) =>
                    handleCategoryChange(e.target.value as PropertyCategoryDb)
                  }
                  className="w-full px-3.5 py-2.5 bg-[#F7F5F0]/50 border border-[#E5E1D8] text-sm text-[#242424] focus:bg-white focus:outline-none focus:border-[#C5A46D] rounded-none"
                  disabled={isSubmitting}
                >
                  <option value="RESIDENTIAL">Residential Houses &amp; Villas</option>
                  <option value="LAND">Land &amp; Demarcated Plots</option>
                  <option value="COMMERCIAL">Commercial Properties &amp; Shops</option>
                </select>
              </div>

              {/* Property Type */}
              <div>
                <label
                  htmlFor="prop-type"
                  className="block text-xs uppercase tracking-widest font-medium text-[#142C38] mb-1.5"
                >
                  Property Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="prop-type"
                  required
                  value={formData.property_type}
                  onChange={(e) =>
                    handlePropertyTypeChange(e.target.value as PropertyTypeDb | '')
                  }
                  className={`w-full px-3.5 py-2.5 border text-sm text-[#242424] focus:bg-white focus:outline-none focus:border-[#C5A46D] rounded-none ${
                    !formData.property_type
                      ? 'border-amber-400 bg-amber-50/40'
                      : 'bg-[#F7F5F0]/50 border-[#E5E1D8]'
                  }`}
                  disabled={isSubmitting}
                >
                  {!formData.property_type && (
                    <option value="">-- Select Property Type (Required) --</option>
                  )}
                  {(CATEGORY_TO_PROPERTY_TYPES_MAP[formData.category] || []).map((type) => (
                    <option key={type} value={type}>
                      {PROPERTY_TYPE_DISPLAY_MAP[type]}
                    </option>
                  ))}
                </select>
                {!formData.property_type && (
                  <p className="text-[11px] text-amber-700 mt-1">
                    Classification required: Please select a property type.
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="prop-status"
                  className="block text-xs uppercase tracking-widest font-medium text-[#142C38] mb-1.5"
                >
                  Publication Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="prop-status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as PropertyStatusDb })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#F7F5F0]/50 border border-[#E5E1D8] text-sm text-[#242424] focus:bg-white focus:outline-none focus:border-[#C5A46D] rounded-none"
                  disabled={isSubmitting}
                >
                  <option value="DRAFT">Draft (Internal Only)</option>
                  <option value="PUBLISHED">Published (Visible Publicly)</option>
                  <option value="UNPUBLISHED">Unpublished (Archived)</option>
                  <option value="SOLD">Sold (Closed Transaction)</option>
                </select>
              </div>

              {/* Total Price in INR */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="prop-price"
                  className="block text-xs uppercase tracking-widest font-medium text-[#142C38] mb-1.5"
                >
                  Total Price in INR (₹)
                </label>
                <input
                  id="prop-price"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.total_price}
                  onChange={(e) => setFormData({ ...formData, total_price: e.target.value })}
                  placeholder="e.g. 4500000 (Enter total amount, leave blank if Price on Consultation)"
                  className="w-full px-3.5 py-2.5 bg-[#F7F5F0]/50 border border-[#E5E1D8] text-sm text-[#242424] focus:bg-white focus:outline-none focus:border-[#C5A46D] rounded-none"
                  disabled={isSubmitting}
                />
                <p className="text-[11px] text-[#666666] mt-1 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-[#C5A46D]" />
                  <span>
                    <strong>Business Policy:</strong> Store and display complete Total Price only. Price per sq.ft is strictly prohibited.
                  </span>
                </p>
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="prop-desc"
                  className="block text-xs uppercase tracking-widest font-medium text-[#142C38] mb-1.5"
                >
                  Property Overview &amp; Description
                </label>
                <textarea
                  id="prop-desc"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide property details, roadside frontage, approach road width, proximity to landmarks..."
                  className="w-full px-3.5 py-2.5 bg-[#F7F5F0]/50 border border-[#E5E1D8] text-sm text-[#242424] focus:bg-white focus:outline-none focus:border-[#C5A46D] rounded-none resize-y"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: LOCATION & REGIONAL SECTOR */}
          <div>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-[#142C38] border-b border-[#E5E1D8] pb-2 mb-4">
              2. Location &amp; Geographic Sector
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* City / District */}
              <div>
                <label
                  htmlFor="prop-location"
                  className="block text-xs uppercase tracking-widest font-medium text-[#142C38] mb-1.5"
                >
                  City / District <span className="text-red-500">*</span>
                </label>
                <input
                  id="prop-location"
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Thanjavur"
                  className="w-full px-3.5 py-2.5 bg-[#F7F5F0]/50 border border-[#E5E1D8] text-sm text-[#242424] focus:bg-white focus:outline-none focus:border-[#C5A46D] rounded-none"
                  disabled={isSubmitting}
                />
              </div>

              {/* Area / Sector */}
              <div>
                <label
                  htmlFor="prop-area-sector"
                  className="block text-xs uppercase tracking-widest font-medium text-[#142C38] mb-1.5"
                >
                  Area / Sector <span className="text-red-500">*</span>
                </label>
                <input
                  id="prop-area-sector"
                  type="text"
                  required
                  list="thanjavur-areas-list"
                  value={formData.area_sector}
                  onChange={(e) => setFormData({ ...formData, area_sector: e.target.value })}
                  placeholder="e.g. Medical College Road or Vallam Corridor"
                  className="w-full px-3.5 py-2.5 bg-[#F7F5F0]/50 border border-[#E5E1D8] text-sm text-[#242424] focus:bg-white focus:outline-none focus:border-[#C5A46D] rounded-none"
                  disabled={isSubmitting}
                />
                <datalist id="thanjavur-areas-list">
                  {THANJAVUR_AREAS_OF_INTEREST.map((area) => (
                    <option key={area.id} value={area.name} />
                  ))}
                </datalist>
                <p className="text-[11px] text-[#888888] mt-1">
                  Select from Thanjavur geographic sectors or type custom area.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 3: CATEGORY-SPECIFIC SPECIFICATIONS */}
          <div>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-[#142C38] border-b border-[#E5E1D8] pb-2 mb-4">
              3. Specifications ({formData.category})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Plot Size (Applicable to all categories) */}
              <div>
                <label
                  htmlFor="prop-plot-size"
                  className="block text-xs uppercase tracking-widest font-medium text-[#142C38] mb-1.5"
                >
                  Plot / Land Size Value
                </label>
                <div className="flex">
                  <input
                    id="prop-plot-size"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.plot_size_value}
                    onChange={(e) =>
                      setFormData({ ...formData, plot_size_value: e.target.value })
                    }
                    placeholder="e.g. 1200 or 2.5"
                    className="w-full px-3.5 py-2.5 bg-[#F7F5F0]/50 border border-r-0 border-[#E5E1D8] text-sm text-[#242424] focus:bg-white focus:outline-none focus:border-[#C5A46D] rounded-none"
                    disabled={isSubmitting}
                  />
                  <select
                    value={formData.plot_size_unit}
                    onChange={(e) =>
                      setFormData({ ...formData, plot_size_unit: e.target.value as SizeUnitDb })
                    }
                    className="px-3 py-2.5 bg-[#E5E1D8]/40 border border-[#E5E1D8] text-xs font-medium text-[#142C38] focus:outline-none rounded-none"
                    disabled={isSubmitting}
                  >
                    <option value="sq.ft">Sq.Ft</option>
                    <option value="cents">Cents</option>
                    <option value="acres">Acres</option>
                  </select>
                </div>
              </div>

              {/* Building Size (Hidden for Land) */}
              {!isLand && (
                <div>
                  <label
                    htmlFor="prop-bldg-size"
                    className="block text-xs uppercase tracking-widest font-medium text-[#142C38] mb-1.5"
                  >
                    Building Size (Sq.Ft)
                  </label>
                  <input
                    id="prop-bldg-size"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.building_size_value}
                    onChange={(e) =>
                      setFormData({ ...formData, building_size_value: e.target.value })
                    }
                    placeholder="e.g. 1850"
                    className="w-full px-3.5 py-2.5 bg-[#F7F5F0]/50 border border-[#E5E1D8] text-sm text-[#242424] focus:bg-white focus:outline-none focus:border-[#C5A46D] rounded-none"
                    disabled={isSubmitting}
                  />
                  <p className="text-[11px] text-[#888888] mt-1">Built-up area in square feet.</p>
                </div>
              )}

              {/* Room Configuration (Only for Residential) */}
              {isResidential && (
                <div>
                  <label
                    htmlFor="prop-rooms"
                    className="block text-xs uppercase tracking-widest font-medium text-[#142C38] mb-1.5"
                  >
                    Room Configuration
                  </label>
                  <input
                    id="prop-rooms"
                    type="text"
                    list="rooms-list"
                    value={formData.room_configuration}
                    onChange={(e) =>
                      setFormData({ ...formData, room_configuration: e.target.value })
                    }
                    placeholder="e.g. 2BHK, 3BHK, 4BHK, Studio"
                    className="w-full px-3.5 py-2.5 bg-[#F7F5F0]/50 border border-[#E5E1D8] text-sm text-[#242424] focus:bg-white focus:outline-none focus:border-[#C5A46D] rounded-none"
                    disabled={isSubmitting}
                  />
                  <datalist id="rooms-list">
                    <option value="1BHK" />
                    <option value="2BHK" />
                    <option value="3BHK" />
                    <option value="4BHK" />
                    <option value="5BHK+" />
                    <option value="Studio" />
                  </datalist>
                </div>
              )}

              {/* Number of Toilets (Hidden for Land) */}
              {!isLand && (
                <div>
                  <label
                    htmlFor="prop-toilets"
                    className="block text-xs uppercase tracking-widest font-medium text-[#142C38] mb-1.5"
                  >
                    Number of Toilets / Bathrooms
                  </label>
                  <input
                    id="prop-toilets"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.number_of_toilets}
                    onChange={(e) =>
                      setFormData({ ...formData, number_of_toilets: e.target.value })
                    }
                    placeholder="e.g. 3"
                    className="w-full px-3.5 py-2.5 bg-[#F7F5F0]/50 border border-[#E5E1D8] text-sm text-[#242424] focus:bg-white focus:outline-none focus:border-[#C5A46D] rounded-none"
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {/* Borewell Availability (Applicable to all) */}
              <div>
                <label className="block text-xs uppercase tracking-widest font-medium text-[#142C38] mb-1.5">
                  Borewell Availability
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, borewell: 'YES' })}
                    className={`py-2 text-xs font-semibold border transition-colors cursor-pointer ${
                      formData.borewell === 'YES'
                        ? 'bg-[#142C38] text-white border-[#142C38]'
                        : 'bg-[#F7F5F0] text-[#666666] border-[#E5E1D8] hover:bg-white'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, borewell: 'NO' })}
                    className={`py-2 text-xs font-semibold border transition-colors cursor-pointer ${
                      formData.borewell === 'NO'
                        ? 'bg-[#142C38] text-white border-[#142C38]'
                        : 'bg-[#F7F5F0] text-[#666666] border-[#E5E1D8] hover:bg-white'
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, borewell: 'UNSPECIFIED' })}
                    className={`py-2 text-xs font-semibold border transition-colors cursor-pointer ${
                      formData.borewell === 'UNSPECIFIED'
                        ? 'bg-[#142C38] text-white border-[#142C38]'
                        : 'bg-[#F7F5F0] text-[#666666] border-[#E5E1D8] hover:bg-white'
                    }`}
                  >
                    Not Specified
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Backblaze B2 Property Image Management */}
          <PropertyImageManager
            propertyId={id || null}
            isEditMode={isEditMode}
            onUploadingChange={setIsUploadingImages}
          />

          {/* Form Actions Footer */}
          <div className="pt-6 border-t border-[#E5E1D8] flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              to="/admin/properties"
              className="w-full sm:w-auto text-center px-5 py-2.5 border border-[#E5E1D8] text-xs uppercase tracking-wider font-semibold text-[#666666] hover:bg-[#F7F5F0] transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting || isUploadingImages}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#142C38] text-white hover:bg-[#0D1E27] active:bg-[#081319] text-xs uppercase tracking-widest font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 text-[#C5A46D] animate-spin" />
                  <span>Saving Property...</span>
                </>
              ) : isUploadingImages ? (
                <>
                  <Loader2 className="w-4 h-4 text-[#C5A46D] animate-spin" />
                  <span>Uploading Photos...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#C5A46D]" />
                  <span>{isEditMode ? 'Update Property' : 'Save Property'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
