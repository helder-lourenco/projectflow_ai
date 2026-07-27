import KpiCards from "../components/admin/KpiCards";
import IdeasList from "../components/admin/IdeasList";
import Roadmap from "../components/admin/Roadmap";
import IdeaDrawer from "../components/admin/IdeaDrawer";
import ApprovalModal from "../components/admin/ApprovalModal";
import UserModal from "../components/admin/UserModal";

import { useState } from "react";

export default function AdminDashboard({
    userSession,
    metrics,
    projects,
    onRefresh
}) {
    const [selectedIdea, setSelectedIdea] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [approvalOpen, setApprovalOpen] = useState(false);
    const [userModalOpen, setUserModalOpen] = useState(false);

    return (
        <div className="space-y-8">
            <KpiCards
                metrics={metrics}
                onApproval={() => setApprovalOpen(true)}
                onUser={() => setUserModalOpen(true)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <IdeasList
                    projects={projects}
                    onOpen={(idea) => {
                        setSelectedIdea(idea);
                        setDrawerOpen(true);
                    }}
                />

                <Roadmap projects={projects} />
            </div>

            <IdeaDrawer
                open={drawerOpen}
                idea={selectedIdea}
                onClose={() => setDrawerOpen(false)}
                onRefresh={onRefresh}
            />

            <ApprovalModal
                open={approvalOpen}
                onClose={() => setApprovalOpen(false)}
                projects={projects}
                onRefresh={onRefresh}
            />

            <UserModal
                open={userModalOpen}
                onClose={() => setUserModalOpen(false)}
            />
        </div>
    );
}