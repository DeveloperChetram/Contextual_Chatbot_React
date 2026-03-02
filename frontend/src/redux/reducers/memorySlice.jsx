import { createSlice } from '@reduxjs/toolkit';

const memorySlice = createSlice({
    name: 'memory',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {
        setMemories(state, action) {
            state.items = action.payload;
        },
        setMemoryLoading(state, action) {
            state.loading = action.payload;
        },
        setMemoryError(state, action) {
            state.error = action.payload;
        },
        removeMemory(state, action) {
            state.items = state.items.filter((m) => m.id !== action.payload);
        },
        clearMemories(state) {
            state.items = [];
        },
    },
});

export const {
    setMemories,
    setMemoryLoading,
    setMemoryError,
    removeMemory,
    clearMemories,
} = memorySlice.actions;

export default memorySlice.reducer;
