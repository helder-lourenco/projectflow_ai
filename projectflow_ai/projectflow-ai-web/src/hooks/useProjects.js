import { useState, useEffect, useCallback, useMemo } from "react";
import * as service from "../services/projectService";

export default function useProjects() {

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadProjects = useCallback(async () => {

        try {

            setLoading(true);

            const data = await service.getProjects();

            setProjects(data);

        } finally {

            setLoading(false);

        }

    }, []);

    useEffect(() => {

        loadProjects();

    }, [loadProjects]);

    const metrics = useMemo(() => {

        return {

            totalProjects: projects.length,

            completed: projects.filter(p => p.status === "Concluído").length,

            pending: projects.filter(
                p =>
                    p.status === "Pendente" ||
                    p.status === "Em Análise"
            ).length

        };

    }, [projects]);

    return {

        loading,

        projects,

        metrics,

        refresh: loadProjects

    };

}