import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Badge } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";

const ChatNotificationIcon = () => {
  const { unreadCount } = useSelector(
    (state) => state.chat || { unreadCount: 0 }
  );

  return (
    <Link to="/chat" className="relative">
      <Badge
        badgeContent={unreadCount}
        color="error"
        max={99}
        sx={{
          "& .MuiBadge-badge": {
            fontSize: "0.7rem",
            height: "18px",
            minWidth: "18px",
          },
        }}
      >
        <ChatIcon sx={{ color: "white", fontSize: "1.5rem" }} />
      </Badge>
    </Link>
  );
};

export default ChatNotificationIcon;
