import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blogsAPI } from '../services/api';
import '../styles/BlogDetailPage.css';

const BlogDetailPage = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        blogsAPI.getById(id).then(setBlog);
    }, [id]);

    if (!blog) return <div className="loading">Đang tải...</div>;

    return (
        <div className="blog-detail-container">

            <article className="blog-article">
                <img src={blog.image} alt={blog.title} className="main-banner" />
                <div className="article-content">
                    <div className="meta">
                        <span>Tác giả: {blog.author}</span> | <span>{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <h1>{blog.title}</h1>
                    <div className="full-text" dangerouslySetInnerHTML={{ __html: blog.content }} />
                </div>
            </article>

            {/* Bạn có thể tích hợp thêm phần bình luận tại đây tương tự như ProductDetailPage */}
        </div>
    );
};

export default BlogDetailPage;