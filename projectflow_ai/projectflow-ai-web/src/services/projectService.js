import { supabase } from "../supabaseClient";

export async function getProjects() {

    const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;

    return data ?? [];
}

export async function updateProjectStatus(id, status) {

    const { error } = await supabase
        .from("projects")
        .update({
            status,
            updated_at: new Date()
        })
        .eq("id", id);

    if (error) throw error;
}