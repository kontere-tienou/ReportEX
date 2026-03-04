import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../components/ui/index.js";

export default function NotFoundRedirect({ to = "/" }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { addToast } = useToast();
    const redirected = useRef(false);

    useEffect(() => {
        if (redirected.current) return;

        redirected.current = true;

        addToast(`Route introuvable: ${location.pathname}`, "warning", 2500, "top-right");

        navigate(to, { replace: true });

    }, [navigate, to]);

    return null;
}