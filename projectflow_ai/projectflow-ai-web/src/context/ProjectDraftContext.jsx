import { createContext, useCallback, useMemo, useState } from "react";

export const ProjectDraftContext = createContext(null);

const initialDraft = {
  // Fluxo
  mode: null, // "manual" | "ai"
  step: 1,

  // Estado geral
  loading: false,
  processing: false,

  // Upload
  upload: {
    file: null,
    fileName: "",
    progress: 0,
  },

  // Dados do projeto
  project: {
    title: "",
    description: "",
    department: "",
    category: "",
    priority: "Média",
    requester: {
      name: "",
      email: "",
    },
    attachments: [],
  },

  // Resultado da IA
  analysis: {
    confidence: null,
    summary: "",
    risks: [],
    opportunities: [],
    suggestedRoadmap: [],
    requirements: [],
  },

  // Logs do processamento
  logs: [],
};

export function ProjectDraftProvider({ children }) {
  const [draft, setDraft] = useState(initialDraft);

  /*
   * Navegação
   */

  const nextStep = useCallback(() => {
    setDraft((prev) => ({
      ...prev,
      step: prev.step + 1,
    }));
  }, []);

  const previousStep = useCallback(() => {
    setDraft((prev) => ({
      ...prev,
      step: Math.max(prev.step - 1, 1),
    }));
  }, []);

  const goToStep = useCallback((step) => {
    setDraft((prev) => ({
      ...prev,
      step,
    }));
  }, []);

  /*
   * Escolha do modo
   */

  const setMode = useCallback((mode) => {
    setDraft((prev) => ({
      ...prev,
      mode,
    }));
  }, []);

  /*
   * Atualiza qualquer campo do projeto
   */

  const updateProject = useCallback((values) => {
    setDraft((prev) => ({
      ...prev,
      project: {
        ...prev.project,
        ...values,
      },
    }));
  }, []);

  /*
   * Atualiza requester
   */

  const updateRequester = useCallback((values) => {
    setDraft((prev) => ({
      ...prev,
      project: {
        ...prev.project,
        requester: {
          ...prev.project.requester,
          ...values,
        },
      },
    }));
  }, []);

  /*
   * Upload
   */

  const setUpload = useCallback((file) => {
    setDraft((prev) => ({
      ...prev,
      upload: {
        ...prev.upload,
        file,
        fileName: file?.name ?? "",
      },
    }));
  }, []);

  const setUploadProgress = useCallback((progress) => {
    setDraft((prev) => ({
      ...prev,
      upload: {
        ...prev.upload,
        progress,
      },
    }));
  }, []);

  /*
   * IA
   */

  const setAnalysis = useCallback((analysis) => {
    setDraft((prev) => ({
      ...prev,
      analysis,
    }));
  }, []);

  /*
   * Logs
   */

  const addLog = useCallback((message) => {
    setDraft((prev) => ({
      ...prev,
      logs: [
        ...prev.logs,
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          message,
        },
      ],
    }));
  }, []);

  const clearLogs = useCallback(() => {
    setDraft((prev) => ({
      ...prev,
      logs: [],
    }));
  }, []);

  /*
   * Loading
   */

  const setLoading = useCallback((loading) => {
    setDraft((prev) => ({
      ...prev,
      loading,
    }));
  }, []);

  const setProcessing = useCallback((processing) => {
    setDraft((prev) => ({
      ...prev,
      processing,
    }));
  }, []);

  /*
   * Reset
   */

  const resetDraft = useCallback(() => {
    setDraft(initialDraft);
  }, []);

  const value = useMemo(
    () => ({
      draft,

      setMode,

      nextStep,
      previousStep,
      goToStep,

      updateProject,
      updateRequester,

      setUpload,
      setUploadProgress,

      setAnalysis,

      addLog,
      clearLogs,

      setLoading,
      setProcessing,

      resetDraft,
    }),
    [
      draft,
      setMode,
      nextStep,
      previousStep,
      goToStep,
      updateProject,
      updateRequester,
      setUpload,
      setUploadProgress,
      setAnalysis,
      addLog,
      clearLogs,
      setLoading,
      setProcessing,
      resetDraft,
    ]
  );

  return (
    <ProjectDraftContext.Provider value={value}>
      {children}
    </ProjectDraftContext.Provider>
  );
}