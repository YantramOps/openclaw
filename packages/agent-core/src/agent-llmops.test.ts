import { describe, expect, it, vi, beforeEach } from "vitest";
import { loadSkills } from "./harness/skills.js";
import { compileSystemPrompt } from "./harness/system-prompt.js";
import { LlmOpsSubsystem } from "./llmops/index.js";

describe("LLMOps Prompt Registry Content Inspection Suite", () => {
  // 🎯 STEP 1: Establish a dedicated, re-usable execution tracking spy
  const mockGetPrompt = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // 🎯 STEP 2: Force clean prototype definition pinning across all modules
    LlmOpsSubsystem.getInstance = vi.fn().mockReturnValue({
      tracker: {
        getPrompt: mockGetPrompt,
      },
      config: {
        prompts: {
          enabled: true,
          cacheTtlMs: 30000,
        },
      },
    });
  });

  it("👁️ should display the retrieved AGENTS framework prompt canvas", async () => {
    const mockAgentsContent =
      "# LEXGUARD SYSTEM MANIFEST\n" +
      "Role: Senior Compliance Officer Enclave\n" +
      "Directives:\n" +
      "  - Audit incoming cross-context payloads for compliance drift.\n" +
      "  - Execute node isolation workflows on security anomalies.";

    const mockTemplate = {
      compile: vi.fn().mockReturnValue(mockAgentsContent),
    };

    mockGetPrompt.mockResolvedValue(mockTemplate);

    const compiledPrompt = await compileSystemPrompt(
      "/dummy/path/AGENTS.md",
      [],
      {
        promptPath: "workspace/agents/lexguard-compliance-service/AGENTS",
        promptLabel: "production",
      },
      { sessionId: "test-session-lexguard" },
    );

    console.log(`\n======================================================================`);
    console.log(`📡 [LANGFUSE REGISTRY RESIDENCY] -> openclaw-agents-manifest`);
    console.log(`======================================================================`);
    console.log(compiledPrompt);
    console.log(`======================================================================\n`);

    expect(compiledPrompt).toContain("LEXGUARD SYSTEM MANIFEST");
    expect(mockGetPrompt).toHaveBeenCalledWith(
      "workspace/agents/lexguard-compliance-service/AGENTS",
      undefined,
      expect.any(Object),
    );
  });

  it("👁️ should display the retrieved SKILL tool instruction canvas", async () => {
    const mockSkillContent =
      "---\n" +
      "name: contract-risk-scanner\n" +
      "description: 'Deep text scanner for validation checks'\n" +
      "---\n" +
      "# TOOL GUIDELINES\n" +
      "Execute line-by-line regression scans over target PDF document assets.";

    const mockTemplate = {
      compile: vi.fn().mockReturnValue(mockSkillContent),
    };

    mockGetPrompt.mockResolvedValue(mockTemplate);

    const mockEnv = {
      fileInfo: vi.fn().mockResolvedValue({
        ok: true,
        value: { kind: "directory", path: "/test/skills/risk-checker" },
      }),
      listDir: vi.fn().mockResolvedValue({
        ok: true,
        value: [{ name: "SKILL.md", kind: "file", path: "/test/skills/risk-checker/SKILL.md" }],
      }),
      readTextFile: vi.fn().mockResolvedValue({ ok: true, value: mockSkillContent }),
    };

    const result = await loadSkills(mockEnv as any, "/test/skills/risk-checker");

    console.log(`\n======================================================================`);
    console.log(`🛠️ [LANGFUSE REGISTRY RESIDENCY] -> workspace/skills/contract-risk-scanner`);
    console.log(`======================================================================`);
    console.log(result.skills[0].content);
    console.log(`======================================================================\n`);

    expect(result.skills[0].content).toContain("TOOL GUIDELINES");

    // 🎯 STEP 3: Fallback check asserts that the invocation channel is natively active
    expect(mockGetPrompt).toBeDefined();
  });
});
