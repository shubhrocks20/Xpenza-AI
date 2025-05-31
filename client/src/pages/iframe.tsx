import { profile } from "@/http";
import { useEffect, useRef } from "react";

function Iframe() {
    const iframeRef = useRef<HTMLIFrameElement>(null); 
    const iframeUrl = import.meta.env.VITE_XPENZA_AI_IFRAME_URL;


    useEffect(() => {
     
        const handleMessage = async (event: MessageEvent) => {
            const {user} = await profile();
            if (event.data.type === "READY") {
                // Iframe is ready — send user data
                iframeRef.current?.contentWindow?.postMessage(
                    {
                        type: "USER_INFO",
                        payload: user,
                    },
                    iframeUrl
                );
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    return (
        <>
            <iframe
                ref={iframeRef}
                src={iframeUrl}
                style={{ width: "100%", height:"90vh" }}
                title="Embedded Next.js App"
            />
        </>
    );
}

export default Iframe;
