import { AzureOpenAIEmbeddings, OpenAIEmbeddings, type OpenAIClient } from '@langchain/openai'
import { observeAiOperation } from './posthogAi'

const usage = (response: OpenAIClient.CreateEmbeddingResponse) => ({ tokens: { prompt_tokens: response.usage?.prompt_tokens } })

export class ObservedOpenAIEmbeddings extends OpenAIEmbeddings {
    protected embeddingWithRetry(request: OpenAIClient.EmbeddingCreateParams) {
        return observeAiOperation('$ai_embedding', 'embedding', 'openai', request.model, () => super.embeddingWithRetry(request), { usage })
    }
}

export class ObservedAzureOpenAIEmbeddings extends AzureOpenAIEmbeddings {
    protected embeddingWithRetry(request: OpenAIClient.EmbeddingCreateParams) {
        return observeAiOperation('$ai_embedding', 'embedding', 'azure_openai', request.model, () => super.embeddingWithRetry(request), {
            usage
        })
    }
}
