import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub
} from "@/components/ui/sidebar"
import { RULES_BY_CATEGORY, type RuleCategory } from "@/grammar/rules"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/app/store"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { Plus, Minus } from "lucide-react"

const CATEGORY_LABELS: Record<RuleCategory, string> = {
  "terminal":            "Terminals",
  "nonterminal":         "Nonterminals",
  "definition":          "Definition",
  "operator-alternation":"Alternation",
  "operator-combine":    "Concatenation",
  "operator-quantify":   "Quantifiers",
  "grouping":            "Grouping",
  "terminator":          "Terminators",
  "comment":             "Comments",
  "other":               "Other",
}

export function NavRules() {
  const { activeRuleIds, toggleRule } = useAppStore()

  const categories = Object.keys(RULES_BY_CATEGORY) as RuleCategory[]

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarMenu>
      <Collapsible className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
            <SidebarGroupLabel className="cursor-pointer hover:bg-secondary/90">
              Rules
              <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
              <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
            </SidebarGroupLabel>
        </CollapsibleTrigger>
        <CollapsibleContent>
        <SidebarMenuSub>
            {categories.map((category) => (
              <div key={category} className="mb-4">
                <p className="text-xs text-muted-foreground font-medium mb-2">
              {CATEGORY_LABELS[category]}
            </p>
            <div className="flex flex-col gap-1">
              {RULES_BY_CATEGORY[category].map((rule) => {
                const isActive = activeRuleIds.includes(rule.id)
                return (
                  <button
                    key={rule.id}
                    onClick={() => toggleRule(rule.id)}
                    title={rule.description}
                    className={cn(
                      "cursor-pointer group flex items-center justify-between w-full text-left px-3 py-2 rounded-md text-xs transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    )}
                  >
                    <span className="font-mono">{rule.label}</span>

                    <span
                      className={cn(
                        "inline-flex items-center justify-center w-4 h-4 rounded-full border transition-colors shrink-0",
                        isActive
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/40 bg-transparent"
                      )}
                    >
                      {isActive && (
                        <svg
                          className="w-2.5 h-2.5 text-primary-foreground"
                          fill="none"
                          viewBox="0 0 10 10"
                        >
                          <path
                            d="M2 5l2.5 2.5L8 3"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        </SidebarMenuSub>
      </CollapsibleContent>
      </SidebarMenuItem>
      </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  )
}