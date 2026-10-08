const PAGE = "#faf9f5";
const INK = "#1f1e1d";
const LINE = "#e3e0d5";
const USER_BUBBLE = "#f0eee6";
const ACCENT = "#d97757";
const FADED = "#e8c4b5";
const SERIF = 'Georgia, "Times New Roman", serif';

const whiteIcon = {
  styles: { default: { filter: "brightness(0) invert(1)" } },
};

const buttonShape = {
  borderRadius: "10px",
  bottom: "14px",
  right: "10px",
};

export function styleChat(chat) {
  chat.introMessage = { text: "Hello. What would you like to work on?" };

  chat.messageStyles = {
    default: {
      shared: {
        bubble: { maxWidth: "85%", padding: "10px 14px", fontSize: "16px", lineHeight: "1.55", color: INK },
      },
      user: { bubble: { backgroundColor: USER_BUBBLE, borderRadius: "14px" } },
      ai: { bubble: { backgroundColor: PAGE, fontFamily: SERIF, paddingLeft: "0" } },
    },
  };

  chat.textInput = {
    placeholder: { text: "How can I help you today?" },
    styles: {
      container: {
        width: "100%",
        marginBottom: "8px",
        backgroundColor: "#ffffff",
        border: "1px solid " + LINE,
        borderRadius: "16px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
      },
      text: { padding: "14px 48px 14px 16px", fontSize: "16px", color: INK },
    },
  };

  chat.submitButtonStyles = {
    submit: { container: { default: { ...buttonShape, backgroundColor: ACCENT } }, svg: whiteIcon },
    disabled: { container: { default: { ...buttonShape, backgroundColor: FADED } }, svg: whiteIcon },
  };

  chat.errorMessages = { displayServiceErrorMessages: true };
}
