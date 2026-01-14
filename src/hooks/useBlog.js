import { useState, useEffect } from 'react';
import { blogsAPI } from '../services/api';

export const useBlog = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const data = await blogsAPI.getAll();
                setBlogs(data);
            } catch (error) {
                console.error("Lỗi tải bài viết:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    return { blogs, loading };
};
