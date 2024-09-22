import React, {
  useState,
  useEffect,
  useLayoutEffect,
    useCallback
  } from 'react';
  import { TouchableOpacity, Text } from 'react-native';
  import { GiftedChat } from 'react-native-gifted-chat';
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import colors from "../colors";
import { initializeTokens, getPhysioChatAssistance } from "../config/ibm";
import { v1 as uuidv1 } from 'uuid';

export default function Chat() {
  const [prompt, setPrompt] = useState(
    "<|system|>\nYou are an expert doctor in the field of physiotherapy, specializing in the latest advancements in healthcare technology and coverage. Your role is to ask 5-10 follow up question and provide clear & accessible advice on physical therapy, tailoring your responses for individuals with diverse levels of knowledge in the healthcare domain.\n<|user|>\n"
  );
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();

  const onSignOut = () => {
    signOut(auth).catch((error) => console.log("Error logging out: ", error));
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{
            marginRight: 10,
          }}
          onPress={onSignOut}
        >
          <AntDesign
            name="logout"
            size={24}
            color={colors.gray}
            style={{ marginRight: 10 }}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);


  const formatUserPrompt = (message) => {
    return message + "\n<|assistant|>\n";
  };

  const formatAssistantPrompt = (message) => {
    return message + "\n<|user|>\n";
  };


  const onSend = useCallback(async (messages = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages)
    );
    const { _id, createdAt, text, user } = messages[0];
    let newPrompt = prompt.concat(formatUserPrompt(text))
    setPrompt(newPrompt);
    response = await getPhysioChatAssistance(newPrompt);
    const newMessage = {
      _id: Date.now() ,
      createdAt: response.created_at,
      text: response.results[0].generated_text,
      user: {
        _id: 2,
        name: "Assistant",
        avatar: "https://i.pravatar.cc/300",
      },
    };
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, [newMessage])
    );
    newPrompt = prompt.concat(formatAssistantPrompt(response.results[0].generated_text))
    setPrompt(newPrompt);
  }, [prompt,setPrompt]);

  useEffect(() => {
    initializeTokens();
  }, []);

  return (
    <GiftedChat
      messages={messages}
      showAvatarForEveryMessage={false}
      showUserAvatar={false}
      onSend={(messages) => onSend(messages)}
      messagesContainerStyle={{
        backgroundColor: "#fff",
      }}
      textInputStyle={{
        backgroundColor: "#fff",
        borderRadius: 20,
      }}
      user={{
        _id: 1,
        name: "Patient",
        avatar: "https://i.pravatar.cc/300",
      }}
      messageIdGenerator={uuidv1}
    />
  );
}
