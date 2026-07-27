import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import {
       X,
    Check,
    AlertTriangle,
    Sparkles,
    Activity,
    Loader2
} from "lucide-react";

import { updateProjectStatus } from "../../services/projectService";

function CardItem({

title,

value

}){

return(

<div

className="bg-slate-950 border border-slate-800 rounded-xl p-4"

>

<p

className="text-xs uppercase tracking-wider text-slate-500"

>

{title}

</p>

<p

className="mt-2 text-white font-semibold"

>

{value}

</p>

</div>

);

}

export default function IdeaDrawer({

    open,
    idea,
    onClose,
    onRefresh

}) {

    const [mounted, setMounted] = useState(false);

    const [visible, setVisible] = useState(false);

    const [loading, setLoading] = useState(false);

    /*
    --------------------------------------
    Monta Portal
    --------------------------------------
    */

    useEffect(() => {

        setMounted(true);

    }, []);

    /*
    --------------------------------------
    Controle da animação
    --------------------------------------
    */

    useEffect(() => {

        if (open) {

            document.body.style.overflow = "hidden";

            requestAnimationFrame(() => {

                setVisible(true);

            });

        } else {

            setVisible(false);

            document.body.style.overflow = "";

        }

        return () => {

            document.body.style.overflow = "";

        };

    }, [open]);

    /*
    --------------------------------------
    ESC fecha Drawer
    --------------------------------------
    */

    useEffect(() => {

        const listener = (event) => {

            if (event.key === "Escape") {

                handleClose();

            }

        };

        window.addEventListener("keydown", listener);

        return () => {

            window.removeEventListener("keydown", listener);

        };

    }, []);

    /*
    --------------------------------------
    Fechamento com animação
    --------------------------------------
    */

    function handleClose() {

        setVisible(false);

        setTimeout(() => {

            onClose?.();

        }, 250);

    }

    /*
    --------------------------------------
    Atualiza Status
    --------------------------------------
    */

    async function changeStatus(status) {

        if (!idea) return;

        try {

            setLoading(true);

            await updateProjectStatus(

                idea.id,
                status

            );

            await onRefresh?.();

            handleClose();

        }

        catch (err) {

            console.error(err);

            alert(err.message);

        }

        finally {

            setLoading(false);

        }

    }

    /*
    --------------------------------------
    Não renderiza
    --------------------------------------
    */

    if (!mounted) return null;

    if (!open) return null;

    return createPortal(

        <>

            {/* Overlay */}

            <div

                onClick={handleClose}

                className={`
                    fixed
                    inset-0
                    bg-black/70
                    backdrop-blur-sm
                    transition-opacity
                    duration-300
                    z-[9998]

                    ${visible
                        ? "opacity-100"
                        : "opacity-0"
                    }
                `}

            />

            {/* Drawer 

            <aside

                className={`
                    fixed
                    top-0
                    right-0
                    h-screen
                    w-full
                    max-w-xl
                    bg-slate-900
                    border-l
                    border-slate-800
                    shadow-2xl
                    z-[9999]

                    transition-transform
                    duration-300
                    ease-out

                    flex
                    flex-col

                    ${visible
                        ? "translate-x-0"
                        : "translate-x-full"
                    }

                `}

            > 
*/}

<aside
    className="
        fixed
        top-0
        right-0
        h-screen
        w-full
        max-w-xl
        bg-slate-900
        border-l
        border-slate-800
        shadow-2xl
        z-[9999]
        relative
    "
>

    {loading && (

<div
className="
absolute
inset-0
bg-slate-900/70
backdrop-blur-sm
flex
items-center
justify-center
z-50
">

    <div className="flex flex-col items-center gap-4">

        <Loader2 className="w-10 h-10 animate-spin text-cyan-400"/>

        <span className="text-slate-300">

            Atualizando demanda...

        </span>

    </div>

</div>

)}

            <header className="flex items-center justify-between p-6 border-b border-slate-800">

    <div className="flex items-center gap-3">

        <div className="p-2 rounded-xl bg-cyan-900">

            <Sparkles className="w-5 h-5 text-cyan-400"/>

        </div>

        <div>

            <h2 className="text-white font-bold">

                Detalhes da Demanda

            </h2>

            <p className="text-slate-400 text-sm">

                Informações completas

            </p>

        </div>

    </div>

    <button

        onClick={handleClose}

        className="p-2 rounded-lg hover:bg-slate-800"

    >

        <X className="w-5 h-5 text-slate-400"/>

    </button>

</header>
<div

className="flex-1 overflow-y-auto p-6 space-y-6"

>

{/* ================================
    Título
================================ */}

<section>

    <h1 className="text-2xl font-black text-white leading-tight">

        {idea?.title}

    </h1>

    <div className="flex flex-wrap gap-2 mt-4">

        <span

            className={`

                px-3
                py-1
                rounded-full
                text-xs
                font-bold

                ${
                    idea?.status === "Concluído"

                    ? "bg-emerald-950 text-emerald-400 border border-emerald-700"

                    : idea?.status === "Em Andamento"

                    ? "bg-blue-950 text-blue-400 border border-blue-700"

                    : idea?.status === "Cancelado"

                    ? "bg-red-950 text-red-400 border border-red-700"

                    : "bg-amber-950 text-amber-400 border border-amber-700"

                }

            `}

        >

            {idea?.status}

        </span>

        {

            idea?.due_date &&

            new Date(idea.due_date) < new Date()

            &&

            idea.status !== "Concluído"

            &&

            <span

                className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-950 text-red-400 border border-red-700 text-xs"

            >

                <AlertTriangle className="w-3 h-3"/>

                Em atraso

            </span>

        }

    </div>

</section>

<section
className="bg-slate-950 rounded-2xl border border-slate-800 p-5"
>

    <h3
    className="text-xs uppercase tracking-wider text-slate-400 mb-3"
    >

        Descrição

    </h3>

    <p
    className="text-sm leading-7 text-slate-200 whitespace-pre-wrap"
    >

        {idea?.description || "Nenhuma descrição cadastrada."}

    </p>

</section>

<section
className="grid gap-4"
>

<CardItem

title="Autor"

value={

idea?.created_by_name ||

idea?.assigned_to_name ||

"-"

}

/>

<CardItem

title="Departamento"

value={

idea?.department ||

"-"

}

/>

<CardItem

title="Último aprovador"

value={

idea?.last_approver_name ||

idea?.approved_by ||

"Aguardando"

}

/>

<CardItem

title="Data de criação"

value={

idea?.created_at

?

new Date(

idea.created_at

).toLocaleDateString("pt-BR")

:

"-"

}

/>

</section>

<section

className="bg-slate-950 rounded-2xl border border-slate-800 p-5"

>

<div

className="flex items-center gap-3 mb-3"

>

<Activity

className="w-5 h-5 text-cyan-400"

/>

<h3

className="text-sm font-bold text-white"

>

Última atividade

</h3>

</div>

<p

className="text-slate-300 text-sm"

>

{

idea?.last_kanban_activity ||

"Movido para análise"

}

</p>

<p

className="text-xs text-slate-500 mt-2"

>

{

idea?.updated_at

?

new Date(

idea.updated_at

).toLocaleString("pt-BR")

:

"Agora"

}

</p>

</section>


</div>


</aside>

<footer className="border-t border-slate-800 p-6 bg-slate-900 space-y-3">

    {
        idea?.status === "Pendente" ||
        idea?.status === "Em Análise"

        ? (

            <div className="grid grid-cols-2 gap-3">

                <button

                    disabled={loading}

                    onClick={() => changeStatus("Em Andamento")}

                    className="
                        h-11
                        rounded-xl
                        bg-emerald-600
                        hover:bg-emerald-500
                        disabled:bg-slate-700
                        disabled:cursor-not-allowed
                        transition
                        text-white
                        font-bold
                        flex
                        justify-center
                        items-center
                        gap-2
                    "

                >

                    {

                        loading

                        ?

                        <>

                            <Loader2
                                className="w-4 h-4 animate-spin"
                            />

                            Atualizando...

                        </>

                        :

                        <>

                            <Check
                                className="w-4 h-4"
                            />

                            Aprovar

                        </>

                    }

                </button>

                <button

                    disabled={loading}

                    onClick={() => changeStatus("Cancelado")}

                    className="
                        h-11
                        rounded-xl
                        bg-red-600
                        hover:bg-red-500
                        disabled:bg-slate-700
                        disabled:cursor-not-allowed
                        transition
                        text-white
                        font-bold
                        flex
                        justify-center
                        items-center
                        gap-2
                    "

                >

                    {

                        loading

                        ?

                        <Loader2
                            className="w-4 h-4 animate-spin"
                        />

                        :

                        <X
                            className="w-4 h-4"
                        />

                    }

                    Rejeitar

                </button>

            </div>

        )

        :

        idea?.status === "Concluído"

        &&

        <button

            disabled={loading}

            onClick={() => changeStatus("Em Andamento")}

            className="
                w-full
                h-11
                rounded-xl
                bg-blue-600
                hover:bg-blue-500
                disabled:bg-slate-700
                text-white
                font-bold
                flex
                justify-center
                items-center
                gap-2
            "

        >

            {

                loading

                ?

                <Loader2
                    className="w-4 h-4 animate-spin"
                />

                :

                <Activity
                    className="w-4 h-4"
                />

            }

            Reabrir Demanda

        </button>

    }

    <button

        disabled={loading}

        onClick={handleClose}

        className="
            w-full
            h-11
            rounded-xl
            border
            border-slate-700
            bg-slate-800
            hover:bg-slate-700
            disabled:opacity-50
            text-slate-300
            font-semibold
            transition
        "

    >

        Fechar

    </button>

</footer>

</>,

document.body

);
}