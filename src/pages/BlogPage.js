import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlog } from '../hooks/useBlog';
import '../styles/BlogPage.css';

const BlogPage = () => {
    const { blogs, loading } = useBlog();
    const navigate = useNavigate();

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