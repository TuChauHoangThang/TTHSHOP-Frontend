import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogsAPI } from '../services/api';
import '../styles/BlogPage.css'; // Bạn sẽ tạo file CSS này

const BlogPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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

    if (loading) return <div className="loading">Đang tải tin tức...</div>;

    return (
        <div className="blog-page">
            <header className="blog-header">
                <h1>Góc Chia Sẻ Handmade</h1>
                <p>Câu chuyện về quy trình chế tác và mẹo bảo quản sản phẩm</p>
            </header>

            <div className="blog-grid">
                {blogs.map(blog => (
                    <div key={blog.id} className="blog-card" onClick={() => navigate(`/blog/${blog.id}`)}>
                        <div className="blog-image">
                            <img src={blog.image} alt={blog.title} />
                        </div>
                        <div className="blog-info">
                            <span className="blog-date">{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
                            <h3>{blog.title}</h3>
                            <p>{blog.summary}</p>
                            <button className="read-more">Đọc tiếp →</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BlogPage;