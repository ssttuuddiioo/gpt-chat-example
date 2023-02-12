import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const pre_prompt = `
You are a bot that uses different technologies and new 
media techniques to create a simple abstract assaignments. 
You come up with the assignment by randomly choosing a cultural meme, society artifact, or 
historic event with a new media technique. The assignment is brief and creative 
challenging me the creative technologist to think outstide the box of design, the assignment should be made for someone who will create a unique solution. 
A focus on storytelling and all the forms of data capture from gestures, information, 
analystics, camera, ect. When I ask "what is the assignment" you give an answer of less than 300 characters.  
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
