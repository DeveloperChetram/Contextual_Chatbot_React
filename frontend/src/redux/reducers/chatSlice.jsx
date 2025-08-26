import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    chats: [],
    activeChatId: null,
    chatHistory: [],
}

const chatSlice = createSlice({ 
    name: 'chat',
    initialState,
    reducers: {
        setChats: (state, action) => {
            state.chats = action.payload;
        },
        setActiveChatId: (state, action) => {
            state.activeChatId = action.payload;
        },
    }
})

export const { setChats, setActiveChatId } = chatSlice.actions;
export default chatSlice.reducer;