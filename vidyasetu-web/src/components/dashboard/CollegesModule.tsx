import { useState, useEffect, useMemo } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Calendar,
  Building2,
  GraduationCap,
  X,
  Users,
  Scale,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getColleges,
  searchColleges,
  getCollegeDetails,
  getDistricts,
} from "@/api/collegesApi";
import type { CollegeListItem, CollegeDetail } from "@/types/api";

export function CollegesModule() {
  // UI and Filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [forGirls, setForGirls] = useState<boolean | null>(null);

  // Selection state
  const [selectedCollege, setSelectedCollege] = useState<CollegeDetail | null>(
    null
  );
  const [compareList, setCompareList] = useState<CollegeDetail[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showCompare, setShowCompare] = useState(false);

  const ITEMS_PER_PAGE = 16;

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      if (searchQuery) setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Lock body scroll when detail modal is open
  useEffect(() => {
    if (selectedCollege) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [selectedCollege]);

  // Districts Query
  const { data: districtsData } = useQuery({
    queryKey: ["districts"],
    queryFn: getDistricts,
    staleTime: Infinity,
  });

  const districts = districtsData?.districts || [];

  // Colleges Query
  const { data: collegesData, isLoading: loading } = useQuery({
    queryKey: [
      "colleges",
      currentPage,
      debouncedSearch,
      selectedDistrict,
      selectedLocation,
      forGirls,
    ],
    queryFn: () => {
      if (debouncedSearch && debouncedSearch.length >= 2) {
        return searchColleges(debouncedSearch, currentPage, ITEMS_PER_PAGE);
      }
      return getColleges({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        district: selectedDistrict || undefined,
        location: selectedLocation || undefined,
        for_girls: forGirls ?? undefined,
      });
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

  const colleges = collegesData?.colleges || [];
  const totalPages = collegesData?.total_pages || 1;
  const totalCount = collegesData?.total || 0;

  // Clear filters
  const clearFilters = () => {
    setSelectedDistrict("");
    setSelectedLocation("");
    setForGirls(null);
    setCurrentPage(1);
  };

  // Page navigation
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Sorted colleges by name
  const sortedColleges = useMemo(() => {
    return [...colleges].sort((a, b) => a.name.localeCompare(b.name));
  }, [colleges]);

  // Toggle compare selection
  const toggleCompare = (college: CollegeListItem) => {
    const exists = compareList.find((c) => c.name === college.name);
    if (exists) {
      setCompareList(compareList.filter((c) => c.name !== college.name));
    } else if (compareList.length < 3) {
      // Add immediately with partial data
      const partialDetail: CollegeDetail = {
        ...college,
        aishe_code: "",
        management: "Loading...",
        university_name: "Loading...",
        courses_offered: [],
        total_courses: 0,
      };
      setCompareList([...compareList, partialDetail]);

      // Fetch full details
      getCollegeDetails(college.name)
        .then((detail) => {
          setCompareList((prev) =>
            prev.map((c) => (c.name === college.name ? detail : c))
          );
        })
        .catch(console.error);
    }
  };

  // View college details
  const viewDetails = (college: CollegeListItem) => {
    setSelectedCollege({
      ...college,
      aishe_code: "",
      management: "",
      university_name: "",
      courses_offered: [],
      total_courses: 0,
    });
    setDetailLoading(true);

    getCollegeDetails(college.name)
      .then((detail) => {
        setSelectedCollege(detail);
      })
      .catch(console.error)
      .finally(() => {
        setDetailLoading(false);
      });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-text-secondary">Loading colleges...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Building2 className="text-secondary" size={24} />
        <h3 className="font-bold text-xl">Explore Colleges</h3>
        <span className="text-text-secondary text-sm bg-surface px-2 py-0.5 rounded-full">
          {totalCount} total
        </span>
        {compareList.length > 0 && (
          <Button
            onClick={() => setShowCompare(true)}
            size="sm"
            className="ml-auto gap-2 bg-gradient-to-r from-secondary to-secondary/80 text-white"
          >
            <Scale size={16} />
            Compare ({compareList.length})
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
          size={18}
        />
        <input
          type="text"
          placeholder="Search colleges..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={selectedDistrict || "all"}
          onValueChange={(val) => setSelectedDistrict(val === "all" ? "" : val)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="District" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            {districts.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedLocation || "all"}
          onValueChange={(val) => setSelectedLocation(val === "all" ? "" : val)}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="Urban">Urban</SelectItem>
            <SelectItem value="Rural">Rural</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={forGirls === null ? "all" : forGirls ? "true" : "false"}
          onValueChange={(val) =>
            setForGirls(val === "all" ? null : val === "true")
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="College Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Colleges</SelectItem>
            <SelectItem value="true">Women's Only</SelectItem>
            <SelectItem value="false">Co-ed</SelectItem>
          </SelectContent>
        </Select>

        {(selectedDistrict || selectedLocation || forGirls !== null) && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-secondary">
          {sortedColleges.length} colleges found
        </span>
        {compareList.length > 0 && (
          <button
            onClick={() => setCompareList([])}
            className="text-sm text-primary font-semibold hover:underline"
          >
            Clear selection ({compareList.length})
          </button>
        )}
      </div>

      {/* College Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {sortedColleges.map((college, i) => {
          const isSelected = compareList.some((c) => c.name === college.name);

          return (
            <motion.div
              key={college.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className={`bg-surface border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                isSelected
                  ? "border-primary border-2 ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => toggleCompare(college)}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    college.for_girls ? "bg-pink-500/15" : "bg-secondary/15"
                  }`}
                >
                  {college.for_girls ? (
                    <Users size={20} className="text-pink-500" />
                  ) : (
                    <Building2 size={20} className="text-secondary" />
                  )}
                </div>
                {isSelected && (
                  <CheckCircle size={18} className="text-primary" />
                )}
              </div>

              {/* College Name */}
              <h4 className="font-semibold text-sm mb-2 line-clamp-2 leading-tight">
                {college.name}
              </h4>

              {/* Meta Info */}
              <div className="space-y-1 mb-3">
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <MapPin size={12} />
                  <span className="text-xs">{college.district}</span>
                </div>
                {college.year_of_establishment && (
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <Calendar size={12} />
                    <span className="text-xs">
                      Est. {college.year_of_establishment}
                    </span>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {college.for_girls && (
                  <span className="px-1.5 py-0.5 bg-pink-500/15 text-pink-500 rounded text-[10px] font-medium">
                    Women's
                  </span>
                )}
                <span className="px-1.5 py-0.5 bg-primary/15 text-primary rounded text-[10px] font-medium">
                  {college.location}
                </span>
              </div>

              {/* View Details */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  viewDetails(college);
                }}
                className="mt-3 text-xs text-primary font-semibold hover:underline"
              >
                View Details →
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {sortedColleges.length === 0 && (
        <div className="text-center py-12 text-text-secondary">
          <GraduationCap className="mx-auto mb-4 opacity-50" size={48} />
          <p>No colleges found matching your criteria</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6 py-4">
          <Button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            variant="ghost"
            size="sm"
            className="gap-1"
          >
            <ChevronLeft size={18} />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === pageNum
                      ? "bg-primary text-text"
                      : "bg-surface hover:bg-surface/80"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <Button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            variant="ghost"
            size="sm"
            className="gap-1"
          >
            Next
            <ChevronRight size={18} />
          </Button>
        </div>
      )}

      {/* Page info */}
      {totalPages > 0 && (
        <p className="text-center text-sm text-text-secondary">
          Page {currentPage} of {totalPages}
        </p>
      )}

      {/* College Detail Modal */}
      {createPortal(
        <AnimatePresence>
          {selectedCollege && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-background overflow-y-auto"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedCollege(null)}
                className="fixed top-6 right-6 z-[10000] p-3 bg-surface border border-border rounded-full hover:bg-surface/80 transition-colors shadow-lg"
              >
                <X size={24} />
              </button>

              <div className="min-h-screen">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-secondary/20 via-primary/10 to-transparent pt-8 pb-12 px-6">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-start gap-5">
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg ${
                          selectedCollege.for_girls
                            ? "bg-gradient-to-br from-pink-500 to-pink-600"
                            : "bg-gradient-to-br from-secondary to-secondary/80"
                        }`}
                      >
                        {selectedCollege.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h1 className="text-2xl font-bold mb-2">
                          {selectedCollege.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-text-secondary text-sm">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={16} />
                            <span>
                              {selectedCollege.district},{" "}
                              {selectedCollege.location}
                            </span>
                          </div>
                          {selectedCollege.year_of_establishment && (
                            <div className="flex items-center gap-1.5">
                              <Calendar size={16} />
                              <span>
                                Est. {selectedCollege.year_of_establishment}
                              </span>
                            </div>
                          )}
                          {selectedCollege.for_girls && (
                            <span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-xs font-medium">
                              Women's College
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto px-6 py-8">
                  {/* Info Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-surface border border-border rounded-xl p-4">
                      <div className="text-text-secondary text-xs mb-1">
                        Type
                      </div>
                      <div className="font-semibold text-sm">
                        {selectedCollege.college_type}
                      </div>
                    </div>
                    <div className="bg-surface border border-border rounded-xl p-4">
                      <div className="text-text-secondary text-xs mb-1">
                        AISHE Code
                      </div>
                      {detailLoading ? (
                        <div className="h-5 bg-border/50 rounded animate-pulse w-20" />
                      ) : (
                        <div className="font-semibold text-sm font-mono">
                          {selectedCollege.aishe_code || "N/A"}
                        </div>
                      )}
                    </div>
                    <div className="bg-surface border border-border rounded-xl p-4">
                      <div className="text-text-secondary text-xs mb-1">
                        Management
                      </div>
                      {detailLoading ? (
                        <div className="h-5 bg-border/50 rounded animate-pulse w-16" />
                      ) : (
                        <div className="font-semibold text-sm">
                          {selectedCollege.management || "N/A"}
                        </div>
                      )}
                    </div>
                    <div className="bg-surface border border-border rounded-xl p-4">
                      <div className="text-text-secondary text-xs mb-1">
                        Total Courses
                      </div>
                      {detailLoading ? (
                        <div className="h-6 bg-border/50 rounded animate-pulse w-10" />
                      ) : (
                        <div className="font-bold text-lg text-primary">
                          {selectedCollege.total_courses}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* University */}
                  {(detailLoading || selectedCollege.university_name) && (
                    <div className="bg-surface border border-border rounded-xl p-4 mb-8">
                      <div className="flex items-center gap-3">
                        <Building2 className="text-text-secondary" size={20} />
                        <div>
                          <div className="text-text-secondary text-xs">
                            Affiliated University
                          </div>
                          {detailLoading ? (
                            <div className="h-5 bg-border/50 rounded animate-pulse w-48 mt-1" />
                          ) : (
                            <div className="font-semibold">
                              {selectedCollege.university_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Courses */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <GraduationCap className="text-primary" size={22} />
                      <h2 className="text-lg font-bold">Courses Offered</h2>
                    </div>
                    {detailLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div
                            key={i}
                            className="bg-surface border border-border rounded-lg p-3 flex items-center gap-3"
                          >
                            <div className="w-8 h-8 bg-border/50 rounded-lg animate-pulse" />
                            <div className="h-4 bg-border/50 rounded animate-pulse flex-1" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedCollege.courses_offered?.map((course, idx) => (
                          <div
                            key={idx}
                            className="bg-surface border border-border rounded-lg p-3 flex items-center gap-3 hover:border-primary/50 transition-colors"
                          >
                            <div className="w-8 h-8 bg-primary/15 rounded-lg flex items-center justify-center text-primary text-sm font-bold">
                              {idx + 1}
                            </div>
                            <span className="text-sm">{course}</span>
                          </div>
                        ))}
                        {(!selectedCollege.courses_offered ||
                          selectedCollege.courses_offered.length === 0) && (
                          <p className="text-text-secondary col-span-2 text-center py-6">
                            No courses information available
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Compare Modal */}
      <AnimatePresence>
        {showCompare && compareList.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCompare(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Scale className="text-secondary" size={24} />
                    <h2 className="text-xl font-bold">Compare Colleges</h2>
                  </div>
                  <button
                    onClick={() => setShowCompare(false)}
                    className="p-2 hover:bg-surface rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 font-medium text-text-secondary">
                          Feature
                        </th>
                        {compareList.map((c) => (
                          <th key={c.name} className="text-left p-3 font-bold">
                            <div className="line-clamp-2">{c.name}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border">
                        <td className="p-3 text-text-secondary">District</td>
                        {compareList.map((c) => (
                          <td key={c.name} className="p-3">
                            {c.district}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 text-text-secondary">Location</td>
                        {compareList.map((c) => (
                          <td key={c.name} className="p-3">
                            {c.location}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 text-text-secondary">Established</td>
                        {compareList.map((c) => (
                          <td key={c.name} className="p-3">
                            {c.year_of_establishment || "N/A"}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 text-text-secondary">Type</td>
                        {compareList.map((c) => (
                          <td key={c.name} className="p-3">
                            {c.college_type}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 text-text-secondary">Management</td>
                        {compareList.map((c) => (
                          <td key={c.name} className="p-3">
                            {c.management || "Loading..."}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 text-text-secondary">University</td>
                        {compareList.map((c) => (
                          <td key={c.name} className="p-3">
                            {c.university_name || "Loading..."}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 text-text-secondary">Women's</td>
                        {compareList.map((c) => (
                          <td key={c.name} className="p-3">
                            {c.for_girls ? (
                              <span className="text-pink-500">Yes</span>
                            ) : (
                              "No"
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-3 text-text-secondary">Courses</td>
                        {compareList.map((c) => (
                          <td key={c.name} className="p-3 font-semibold">
                            {c.total_courses || "..."}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
