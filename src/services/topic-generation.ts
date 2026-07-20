import type { CreateFormValues } from "@/lib/jenius/generatedPack";

export interface TopicGenerationResult {
  status: "request-stored";
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
