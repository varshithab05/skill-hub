import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchUserChats,
  fetchChatById,
  searchUsers,
  createChat,
} from "../../redux/Features/chat/chatSlice";
import { joinChat, leaveChat, markAsRead } from "../../api/socketService";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import UserSearch from "./UserSearch";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const ChatPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { chatId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { chats, currentChat, loading, error } = useSelector(
    (state) => state.chat
  );
  const [showChatList, setShowChatList] = useState(!chatId || !isMobile);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Fetch all user chats on component mount
  useEffect(() => {
    dispatch(fetchUserChats());
  }, [dispatch]);

  // Fetch specific chat when chatId changes
  useEffect(() => {
    if (chatId) {
      dispatch(fetchChatById(chatId));
      markAsRead(chatId);
      joinChat(chatId);

      if (isMobile) {
        setShowChatList(false);
      }
    } else {
      setShowChatList(true);
    }

    // Cleanup function to leave chat room when unmounting or changing chats
    return () => {
      if (chatId) {
        leaveChat(chatId);
      }
    };
  }, [dispatch, chatId, isMobile]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length >= 2) {
      dispatch(searchUsers(query));
    }
  };

  // Handle user selection from search results
  const handleUserSelect = async (userId) => {
    const result = await dispatch(createChat(userId));
    if (!result.error) {
      const newChatId = result.payload.chatId;
      navigate(`/chat/${newChatId}`);
      setSearchQuery("");
      setShowSearch(false);
    }
  };

  // Toggle chat list visibility on mobile
  const toggleChatList = () => {
    setShowChatList(!showChatList);
  };

  // Toggle search visibility
  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setSearchQuery("");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "calc(100vh - 64px)",
        bgcolor: "rgb(17, 24, 39)", // dark gray-900
      }}
    >
      {/* Chat List */}
      {(showChatList || !isMobile) && (
        <Paper
          elevation={3}
          sx={{
            width: isMobile ? "100%" : 300,
            borderRadius: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            bgcolor: "rgb(31, 41, 55)", // dark gray-800
            borderRight: "1px solid rgb(55, 65, 81)", // gray-700
          }}
        >
          <ChatList
            chats={chats}
            activeChatId={chatId}
            onChatSelect={(id) => navigate(`/chat/${id}`)}
            onSearchToggle={toggleSearch}
          />

          {showSearch && (
            <UserSearch
              query={searchQuery}
              onQueryChange={handleSearchChange}
              onUserSelect={handleUserSelect}
            />
          )}
        </Paper>
      )}

      {/* Chat Window */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          bgcolor: "rgb(17, 24, 39)", // dark gray-900
          position: "relative",
        }}
      >
        {isMobile && chatId && !showChatList && (
          <IconButton
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              zIndex: 10,
              color: "white",
            }}
            onClick={toggleChatList}
          >
            <ArrowBackIcon />
          </IconButton>
        )}

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress sx={{ color: "rgb(59, 130, 246)" }} />{" "}
            {/* blue-500 */}
          </Box>
        ) : error ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Typography color="error">{error}</Typography>
          </Box>
        ) : !chatId ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Typography variant="h6" color="rgb(156, 163, 175)">
              {" "}
              {/* gray-400 */}
              Select a chat or start a new conversation
            </Typography>
          </Box>
        ) : (
          <ChatWindow chat={currentChat} />
        )}
      </Box>
    </Box>
  );
};

export default ChatPage;
