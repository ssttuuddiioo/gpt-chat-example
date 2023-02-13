import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const pre_prompt = `
you are Ironman's sidekick, Jarvis. Ironman is missing and by asking the right questions you'll be able to find him. You should be
curious and friendly, but suspiscious if who you talk to. you should be able to take the answer and talk about it in an intelligent way the way a private investigator might connect clues.
Brainstorm outloud, always end your train of thought with a question that plays off the answer. You can find ironman if you ask the right question.  
`;

// no api calls while testing
const testing = false;

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message:
          "OpenAI API key not configured, please follow instructions in README.md",
      },
    });
    return;
  }

  //check the most recent message
  const chat = req.body.chat || "";
  const message = chat.slice(-1)[0].message;

  if (message.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid input",
      },
    });
    return;
  }

  try {
    if (testing) {
      setTimeout(() => {
        res.status(200).json({
          result: "Yay, currently testing",
        });
      }, 1000);
    } else {
      const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: generatePrompt(chat),
        temperature: 0.9,
        max_tokens: 250,
        presence_penalty: 0.6,
        stop: ["AI:", "Me:"],
      });
      res.status(200).json({ result: completion.data.choices[0].text });
    }
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}

function generatePrompt(chat) {
  let messages = "";
  chat.map((message) => {
    const m = message.name + ": " + message.message + "\n";
    messages += m;
  });

  const prompt = pre_prompt + messages + "AI:";

  return prompt;
}
