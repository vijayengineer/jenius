import type { CreateFormValues } from "@/lib/jenius/generatedPack";
import type { GeneratedConcept } from "../../shared/contracts";
import type { JeniusApiClient } from "@/api/client";

export interface TopicGenerationResult {
  status: "request-stored" | "generated";
  concept?: GeneratedConcept;
}

export class RemoteTopicGenerationService implements TopicGenerationService {
  constructor(private readonly api: JeniusApiClient) {}

  async request(values: CreateFormValues): Promise<TopicGenerationResult> {
    const result = await this.api.generate({
      topic: values.topic.trim(),
      learnerLevel: values.readingLevel || undefined,
      reasonForLearning:
        [values.subject ? `Subject area: ${values.subject}.` : "", values.goal]
          .filter(Boolean)
          .join(" ") || undefined,
      preferredStyle: values.length === "quick" ? "concise" : "balanced",
    });
    return { status: "generated", concept: result.concept };
  }
}

export interface TopicGenerationService {
  request(values: CreateFormValues): Promise<TopicGenerationResult>;
}

/**
 * Local release implementation. It deliberately records intent only and
 * never fabricates a generated learning pack.
 */
export class LocalTopicGenerationService implements TopicGenerationService {
  constructor(private readonly store: (values: CreateFormValues) => void) {}

  async request(values: CreateFormValues): Promise<TopicGenerationResult> {
    this.store(values);
    return { status: "request-stored" };
  }
}
