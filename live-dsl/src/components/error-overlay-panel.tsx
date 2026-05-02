import { CircleAlert } from "lucide-react"
import { Button } from "./ui/button";

interface ErrorOverlayPanelProps {
    label?: string;
    visible?: boolean;
    isUppercase?: boolean;
    onDismiss?: () => void;
    children?: React.ReactNode;
}


export function ErrorOverlayPanel({ label = "error", visible = true, isUppercase = true, onDismiss, children }: ErrorOverlayPanelProps) {

    return (
        <div className="relative w-full h-full ">
            {visible &&
                <div className="absolute inset-0 border border-destructive shadow-[inset_0_0_28px_4px_color-mix(in_srgb,var(--destructive)_9%,transparent)] pointer-events-none z-1">
                    <div className="flex items-center justify-between px-2 p-1 bg-destructive font-bold text-xs">
                    <span className={"flex items-center gap-1 " + (isUppercase ? "uppercase" : "")}>
                        <CircleAlert size={12} />
                        {label}
                    </span>
                    <Button size="xs" variant="link" className="cursor-pointer pointer-events-auto" onClick={onDismiss}>
                        Never tell me again
                    </Button>
                    </div>
                </div>
            }
            <div className={visible ? "w-full h-full pt-8" : "w-full h-full"}>
                {children}
            </div>
        </div>
    )
}