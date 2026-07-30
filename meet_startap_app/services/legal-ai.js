const MODEL = "qwen/qwen3.6-27b";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

const LEGAL_RIGHTS_CONTEXT = `
Workplace sexual-harassment rights in Israel:
1. A person may submit a workplace complaint orally or in writing, and another person may submit it on their behalf.
2. The complaint should be investigated promptly and as privately as possible.
3. The complainant should be protected from retaliation or workplace harm, including dismissal, demotion, reduced hours, or unfair treatment.
4. The complainant may be separated from the person complained about when appropriate and possible.
5. The complainant may receive a reasoned written decision and review the investigation summary and recommendations.
6. A person may file a police complaint, a civil lawsuit, or both, in addition to a workplace complaint.
7. When a manager or supervisor abuses their authority, the complainant is not required to prove that they clearly rejected repeated sexual advances or comments.
8. If harassment caused physical or psychological harm, a person may apply for recognition as a work-injury victim and may qualify for medical treatment, injury benefits, or disability benefits.
9. A person who resigned because of workplace sexual harassment may apply for unemployment benefits without the usual waiting period, subject to eligibility requirements.
`;

const EMPLOYER_DUTIES_CONTEXT = `
Employer responsibilities:
1. Appoint someone responsible for handling sexual-harassment complaints.
2. Provide a clear way to submit complaints.
3. Investigate complaints without unnecessary delay.
4. Protect the complainant and take steps to stop further harassment.
5. Publish a sexual-harassment policy when the workplace has more than 25 employees.
`;

const HARASSMENT_CONTEXT = `
Workplace sexual harassment is unwanted behavior of a sexual nature that makes a person feel uncomfortable, unsafe, or humiliated.
Examples include sexual comments or jokes about a woman's body or appearance; sending sexual messages or pictures; touching someone without permission; repeatedly requesting dates or sexual favors after being refused; threatening someone's job or promotion unless they agree to sexual behavior; and creating a sexual or uncomfortable environment at work.
`;

const RIGHTS_REPLY = `Your workplace sexual-harassment rights include:

• Submit a complaint orally or in writing, personally or through someone else.
• Receive a prompt, private investigation and a reasoned written decision.
• Be protected from retaliation and separated from the accused when appropriate.
• File a police complaint, a civil lawsuit, or both.
• Seek work-injury recognition if the harassment caused physical or psychological harm.
• Apply for unemployment benefits without the usual waiting period after resigning because of harassment, subject to eligibility.

This is general information, not legal advice.`;

const getLocalReply = (message) => {
  const normalized = message.trim().toLowerCase().replace(/[?!.,]/g, "");

  if (/^(hi|hello|hey|good morning|good evening)$/.test(normalized)) {
    return "Hi! I’m here to help with general questions about workplace rights and harassment in Israel.";
  }

  if (/^(how are you|how are you doing|whats up|what's up)$/.test(normalized)) {
    return "I’m doing well, thank you. How can I help you with your workplace rights today?";
  }

  if (/^(thanks|thank you|thankyou)$/.test(normalized)) {
    return "You’re welcome. I’m here if you have another question.";
  }

  if (/^(what can you do|help)$/.test(normalized)) {
    return "I can give brief general information about workplace harassment rights, reporting options, and next steps in Israel.";
  }

  if (
    /^(tell|explain|show|list)( me)?( more)? about (my|workplace|sexual harassment) rights$/.test(
      normalized
    ) ||
    /^(what|which) (are )?(my|the|workplace) rights$/.test(normalized)
  ) {
    return RIGHTS_REPLY;
  }

  return null;
};

const hasCompleteEnding = (text) => /[.!?]["')\]]?$/.test(text.trim());

export async function askLegalAssistant(message) {
  const localReply = getLocalReply(message);
  if (localReply) {
    console.warn("[Legal AI local response]", localReply);
    return { id: null, text: localReply };
  }

  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Groq is not configured. Add EXPO_PUBLIC_GROQ_API_KEY to your local .env.local file."
    );
  }

  const systemInstruction = `You are Amanor's legal information assistant for workplace sexual-harassment rights in Israel.

Use these verified references when answering.

Rights:
${LEGAL_RIGHTS_CONTEXT}

What employers must do:
${EMPLOYER_DUTIES_CONTEXT}

Definition and examples of sexual harassment:
${HARASSMENT_CONTEXT}

Answer the user's question directly and completely in 80-160 words. Use 3-6 concise bullets when listing information; otherwise use two short paragraphs. When the user asks about their rights, give concrete rights from the Rights reference instead of a vague summary, but combine related points to keep the answer readable. Do not begin with a generic offer to help and do not ask what kind of rights the user means. Do not invent facts beyond the reference; say when the reference does not contain the answer. State that the response is general information, not legal advice. Never request identifying details. Always complete every sentence and end the response with punctuation.`;

  const asksAboutRights = /\bright(s)?\b/i.test(message);
  const detailedInput = asksAboutRights
    ? `${message}\n\nGive a useful, medium-length answer using concrete rights from the supplied reference. Combine related rights into a short, readable list.`
    : message;

  const generate = async (
    input,
    maxCompletionTokens = asksAboutRights ? 700 : 550
  ) => {
    const result = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: input },
        ],
        max_completion_tokens: maxCompletionTokens,
        temperature: 0.2,
        reasoning_effort: "none",
      }),
    });

    const data = await result.json();
    if (!result.ok) {
      const error = new Error(
        data?.error?.message || `Groq request failed with status ${result.status}.`
      );
      error.status = result.status;
      throw error;
    }

    return data;
  };

  let response;

  try {
    response = await generate(detailedInput);
  } catch (error) {
    const isQuotaError =
      error?.status === 429 ||
      error?.code === 429 ||
      /429|resource_exhausted|quota/i.test(error?.message || "");

    if (isQuotaError) {
      throw new Error(
        "The Legal AI has reached its Groq rate limit. Please wait briefly and try again."
      );
    }

    throw error;
  }

  let responseText = response.choices?.[0]?.message?.content?.trim();
  if (!responseText) {
    throw new Error("The assistant returned an empty response.");
  }

  if (!hasCompleteEnding(responseText)) {
    response = await generate(
      `${detailedInput}\n\nReturn a fresh, complete answer. The previous attempt was cut off. Finish every sentence.`,
      asksAboutRights ? 1000 : 800
    );
    responseText = response.choices?.[0]?.message?.content?.trim();
    if (!responseText) {
      throw new Error("The assistant returned an empty response.");
    }
  }

  console.warn("[Legal AI response]", responseText);
  console.warn("[Legal AI finish reason]", response.choices?.[0]?.finish_reason);

  return {
    id: response.id,
    text: responseText,
  };
}
