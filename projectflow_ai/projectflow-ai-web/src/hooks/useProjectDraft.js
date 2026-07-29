import { useContext } from "react";
import { ProjectDraftContext } from "../context/ProjectDraftContext";

export default function useProjectDraft() {
    const context = useContext(ProjectDraftContext);

    if (!context) {
        throw new Error(
            "useProjectDraft deve ser utilizado dentro de ProjectDraftProvider"
        );
    }

    return context;
}