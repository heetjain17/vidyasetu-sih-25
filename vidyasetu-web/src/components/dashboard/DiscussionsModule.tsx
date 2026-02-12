import React, { useState } from "react";
import { ForumLayout } from "./forum/ForumLayout";
import { DiscussionListModule } from "./forum/DiscussionListModule";
import { DiscussionThreadModule } from "./forum/DiscussionThreadModule";
import { CreateDiscussionModal } from "./forum/CreateDiscussionModal";

export const DiscussionsModule: React.FC = () => {
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedDiscussionId, setSelectedDiscussionId] = useState<
    number | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectDiscussion = (id: number) => {
    setSelectedDiscussionId(id);
    setView("detail");
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToList = () => {
    setView("list");
    setSelectedDiscussionId(null);
  };

  const handleCreateDiscussion = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <ForumLayout selectedTag={selectedTag} onSelectTag={setSelectedTag}>
        {view === "list" ? (
          <DiscussionListModule
            selectedTag={selectedTag}
            onSelectDiscussion={handleSelectDiscussion}
            onCreateDiscussion={handleCreateDiscussion}
          />
        ) : (
          <DiscussionThreadModule
            discussionId={selectedDiscussionId!}
            onBack={handleBackToList}
          />
        )}
      </ForumLayout>

      <CreateDiscussionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
