import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

const prisma = globalThis.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

// Database auto-seeding if completely empty
async function ensureAdminExists() {
    try {
        const count = await prisma.user.count()
        if (count === 0) {
            console.log('--------------------------------------------------')
            console.log('Database is empty. Seeding default admin user...')
            const hashedPassword = await bcrypt.hash('admin123', 10)
            await prisma.user.create({
                data: {
                    name: 'admin',
                    password: hashedPassword,
                    role: 'ADMIN',
                    image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
                    active: true
                }
            })
            console.log('Seeded default admin user (name: "admin", password: "admin123")!')
            console.log('--------------------------------------------------')
        }
    } catch (err) {
        console.error('Error checking/seeding admin user:', err)
    }
}

export default defineConfig({
    plugins: [
        react(),
        babel({ presets: [reactCompilerPreset()] }),
        {
            name: 'postgres-db-middleware',
            configureServer(server) {
                // Seed when server starts
                ensureAdminExists()

                server.middlewares.use(async (req, res, next) => {
                    if (req.url?.startsWith('/api/')) {
                        res.setHeader('Content-Type', 'application/json')
                        try {
                            // GET /api/users
                            if (req.url === '/api/users' && req.method === 'GET') {
                                const users = await prisma.user.findMany({
                                    select: { id: true, name: true, role: true, image: true, active: true }
                                })
                                res.end(JSON.stringify(users))
                                return
                            }

                            // POST /api/users (Add account from admin panel)
                            if (req.url === '/api/users' && req.method === 'POST') {
                                let body = ''
                                req.on('data', chunk => body += chunk)
                                req.on('end', async () => {
                                    try {
                                        const data = JSON.parse(body)
                                        if (!data.name || !data.password) {
                                            res.statusCode = 400
                                            res.end(JSON.stringify({ error: 'Username and Password are required' }))
                                            return
                                        }
                                        const existing = await prisma.user.findUnique({ where: { name: data.name } })
                                        if (existing) {
                                            res.statusCode = 400
                                            res.end(JSON.stringify({ error: 'User already exists' }))
                                            return
                                        }
                                        const hashedPassword = await bcrypt.hash(data.password, 10)
                                        const newUser = await prisma.user.create({
                                            data: {
                                                name: data.name,
                                                password: hashedPassword,
                                                role: data.role || 'USER',
                                                image: data.image || null,
                                                active: true
                                            }
                                        })
                                        res.end(JSON.stringify(newUser))
                                    } catch (e) {
                                        res.statusCode = 400
                                        res.end(JSON.stringify({ error: e.message }))
                                    }
                                })
                                return
                            }

                            // POST /api/users/update
                            if (req.url === '/api/users/update' && req.method === 'POST') {
                                let body = '';
                                req.on('data', chunk => body += chunk);
                                req.on('end', async () => {
                                    try {
                                        const { username, pfp, banner, description } = JSON.parse(body);
                                        if (!username) {
                                            res.statusCode = 400;
                                            res.end(JSON.stringify({ error: 'Username is required' }));
                                            return;
                                        }
                                        const updatedUser = await prisma.user.update({
                                            where: { name: username },
                                            data: {
                                                image: pfp,
                                                banner: banner,
                                                description: description
                                            }
                                        });
                                        res.end(JSON.stringify({
                                            name: updatedUser.name,
                                            role: updatedUser.role || 'USER',
                                            pfp: updatedUser.image || "/tempuser/temporary_pfp.png",
                                            banner: updatedUser.banner || "/tempuser/temporary_banner.png",
                                            description: updatedUser.description || ""
                                        }));
                                    } catch (e) {
                                        res.statusCode = 400;
                                        res.end(JSON.stringify({ error: e.message }));
                                    }
                                });
                                return;
                            }

                            // POST /api/auth/login
                            if (req.url === '/api/auth/login' && req.method === 'POST') {
                                let body = ''
                                req.on('data', chunk => body += chunk)
                                req.on('end', async () => {
                                    try {
                                        const { username, password } = JSON.parse(body)
                                        const user = await prisma.user.findUnique({ where: { name: username } })
                                        if (!user) {
                                            res.statusCode = 401
                                            res.end(JSON.stringify({ error: 'Credenciales inválidas / Invalid credentials' }))
                                            return
                                        }
                                        
                                        let isMatch = false
                                        // Check if password is already hashed with bcrypt
                                        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
                                            isMatch = await bcrypt.compare(password, user.password)
                                        } else {
                                            // Fallback for old plain text passwords
                                            isMatch = (user.password === password)
                                            // Auto-migrate to hashed password if correct
                                            if (isMatch) {
                                                const newHash = await bcrypt.hash(password, 10)
                                                await prisma.user.update({
                                                    where: { id: user.id },
                                                    data: { password: newHash }
                                                })
                                            }
                                        }

                                        if (!isMatch) {
                                            res.statusCode = 401
                                            res.end(JSON.stringify({ error: 'Credenciales inválidas / Invalid credentials' }))
                                            return
                                        }
                                        res.end(JSON.stringify({
                                            name: user.name,
                                            role: user.role || 'USER',
                                            pfp: user.image || "/tempuser/temporary_pfp.png",
                                            banner: "/tempuser/temporary_banner.png",
                                            description: user.description || ""
                                        }))
                                    } catch (e) {
                                        res.statusCode = 400
                                        res.end(JSON.stringify({ error: e.message }))
                                    }
                                })
                                return
                            }

                            // POST /api/auth/register
                            if (req.url === '/api/auth/register' && req.method === 'POST') {
                                let body = ''
                                req.on('data', chunk => body += chunk)
                                req.on('end', async () => {
                                    try {
                                        const { username, password } = JSON.parse(body)
                                        if (!username || !password) {
                                            res.statusCode = 400
                                            res.end(JSON.stringify({ error: 'Username and Password are required' }))
                                            return
                                        }
                                        const existing = await prisma.user.findUnique({ where: { name: username } })
                                        if (existing) {
                                            res.statusCode = 400
                                            res.end(JSON.stringify({ error: 'El usuario ya existe / User already exists' }))
                                            return
                                        }
                                        const hashedPassword = await bcrypt.hash(password, 10)
                                        const newUser = await prisma.user.create({
                                            data: {
                                                name: username,
                                                password: hashedPassword,
                                                role: 'USER', // Default role is USER for maximum security
                                                active: true
                                            }
                                        })
                                        res.end(JSON.stringify({
                                            name: newUser.name,
                                            role: newUser.role || 'USER',
                                            pfp: newUser.image || "/tempuser/temporary_pfp.png",
                                            banner: "/tempuser/temporary_banner.png",
                                            description: newUser.description || ""
                                        }))
                                    } catch (e) {
                                        res.statusCode = 400
                                        res.end(JSON.stringify({ error: e.message }))
                                    }
                                })
                                return
                            }

                            // GET /api/favorites/posts
                            if (req.url.startsWith('/api/favorites/posts') && req.method === 'GET') {
                                const urlObj = new URL(req.url, 'http://localhost');
                                const username = urlObj.searchParams.get('username');
                                if (!username) { res.statusCode = 400; res.end(JSON.stringify({ error: 'Username required' })); return; }
                                const user = await prisma.user.findUnique({ where: { name: username }, include: { likedPosts: { include: { user: { select: { name: true, image: true } } }, orderBy: { createdAt: 'desc' } } } });
                                res.end(JSON.stringify(user?.likedPosts || []));
                                return;
                            }

                            // POST /api/favorites/posts
                            if (req.url === '/api/favorites/posts' && req.method === 'POST') {
                                let body = '';
                                req.on('data', chunk => body += chunk);
                                req.on('end', async () => {
                                    try {
                                        const { username, postId } = JSON.parse(body);
                                        const user = await prisma.user.findUnique({ where: { name: username }, include: { likedPosts: true } });
                                        if (!user) return res.end(JSON.stringify({ error: 'User not found' }));
                                        const isLiked = user.likedPosts.some(p => p.id === postId);
                                        if (isLiked) {
                                            await prisma.user.update({ where: { name: username }, data: { likedPosts: { disconnect: { id: postId } } } });
                                        } else {
                                            await prisma.user.update({ where: { name: username }, data: { likedPosts: { connect: { id: postId } } } });
                                        }
                                        res.end(JSON.stringify({ success: true, isLiked: !isLiked }));
                                    } catch (e) { res.statusCode = 400; res.end(JSON.stringify({ error: e.message })); }
                                });
                                return;
                            }

                            // GET /api/favorites/media
                            if (req.url.startsWith('/api/favorites/media') && req.method === 'GET') {
                                const urlObj = new URL(req.url, 'http://localhost');
                                const username = urlObj.searchParams.get('username');
                                if (!username) { res.statusCode = 400; res.end(JSON.stringify({ error: 'Username required' })); return; }
                                const user = await prisma.user.findUnique({ where: { name: username }, include: { likedMedia: { orderBy: { createdAt: 'desc' } } } });
                                res.end(JSON.stringify(user?.likedMedia || []));
                                return;
                            }

                            // POST /api/favorites/media
                            if (req.url === '/api/favorites/media' && req.method === 'POST') {
                                let body = '';
                                req.on('data', chunk => body += chunk);
                                req.on('end', async () => {
                                    try {
                                        const { username, media } = JSON.parse(body);
                                        const user = await prisma.user.findUnique({ where: { name: username }, include: { likedMedia: true } });
                                        if (!user) return res.end(JSON.stringify({ error: 'User not found' }));
                                        const existing = user.likedMedia.find(m => m.externalId === String(media.id));
                                        if (existing) {
                                            await prisma.favoriteMedia.delete({ where: { id: existing.id } });
                                            res.end(JSON.stringify({ success: true, isLiked: false }));
                                        } else {
                                            await prisma.favoriteMedia.create({
                                                data: {
                                                    externalId: String(media.id),
                                                    type: media.type || 'game',
                                                    title: media.title || '',
                                                    image: media.image || null,
                                                    developer: media.developer || null,
                                                    genre: media.genre || null,
                                                    userId: user.id
                                                }
                                            });
                                            res.end(JSON.stringify({ success: true, isLiked: true }));
                                        }
                                    } catch (e) { res.statusCode = 400; res.end(JSON.stringify({ error: e.message })); }
                                });
                                return;
                            }

                            // GET /api/downloads
                            if (req.url === '/api/downloads' && req.method === 'GET') {
                                const downloads = await prisma.downloadItem.findMany({
                                    orderBy: { createdAt: 'desc' },
                                    include: { user: { select: { name: true, image: true } } }
                                });
                                res.end(JSON.stringify(downloads));
                                return;
                            }

                            // POST /api/downloads
                            if (req.url === '/api/downloads' && req.method === 'POST') {
                                let body = '';
                                req.on('data', chunk => body += chunk);
                                req.on('end', async () => {
                                    try {
                                        const { username, title, description, base64 } = JSON.parse(body);
                                        if (!username || !title || !base64) {
                                            res.statusCode = 400;
                                            res.end(JSON.stringify({ error: 'Username, title, and file data are required' }));
                                            return;
                                        }
                                        const user = await prisma.user.findUnique({ where: { name: username } });
                                        if (!user) {
                                            res.statusCode = 404;
                                            res.end(JSON.stringify({ error: 'User not found' }));
                                            return;
                                        }

                                        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
                                        if (!fs.existsSync(uploadsDir)) {
                                            fs.mkdirSync(uploadsDir, { recursive: true });
                                        }

                                        const matches = base64.match(/^data:(.+);base64,(.+)$/);
                                        if (!matches || matches.length !== 3) {
                                            res.statusCode = 400;
                                            res.end(JSON.stringify({ error: 'Invalid base64 format' }));
                                            return;
                                        }
                                        const fileData = matches[2];
                                        const buffer = Buffer.from(fileData, 'base64');
                                        const safeTitle = title.replace(/[^a-zA-Z0-9.\-_ ]/g, '_');
                                        const fileName = `${Date.now()}-${safeTitle}`;
                                        const filePath = path.join(uploadsDir, fileName);

                                        fs.writeFileSync(filePath, buffer);

                                        const fileUrl = `/uploads/${fileName}`;

                                        const newDownload = await prisma.downloadItem.create({
                                            data: {
                                                title,
                                                description: description || null,
                                                fileUrl,
                                                userId: user.id
                                            },
                                            include: { user: { select: { name: true, image: true } } }
                                        });

                                        res.end(JSON.stringify(newDownload));
                                    } catch (e) {
                                        console.error('Upload error:', e);
                                        res.statusCode = 400;
                                        res.end(JSON.stringify({ error: e.message }));
                                    }
                                });
                                return;
                            }

                            // DELETE /api/downloads/:id
                            if (req.url.startsWith('/api/downloads/') && req.method === 'DELETE') {
                                const id = req.url.split('/').pop();
                                // Also delete the file from disk if we want to be clean!
                                const item = await prisma.downloadItem.findUnique({ where: { id } });
                                if (item && item.fileUrl) {
                                    const filePath = path.join(process.cwd(), 'public', item.fileUrl);
                                    if (fs.existsSync(filePath)) {
                                        fs.unlinkSync(filePath);
                                    }
                                }
                                await prisma.downloadItem.delete({ where: { id } });
                                res.end(JSON.stringify({ success: true }));
                                return;
                            }

                            // GET /api/agenda
                            if (req.url === '/api/agenda' && req.method === 'GET') {
                                const events = await prisma.agendaEvent.findMany({
                                    orderBy: { date: 'asc' },
                                    include: { user: { select: { name: true, image: true } } }
                                });
                                res.end(JSON.stringify(events));
                                return;
                            }

                            // POST /api/agenda
                            if (req.url === '/api/agenda' && req.method === 'POST') {
                                let body = '';
                                req.on('data', chunk => body += chunk);
                                req.on('end', async () => {
                                    try {
                                        const { username, title, description, date, time } = JSON.parse(body);
                                        if (!username || !title || !date) {
                                            res.statusCode = 400;
                                            res.end(JSON.stringify({ error: 'Username, title, and date are required' }));
                                            return;
                                        }
                                        const user = await prisma.user.findUnique({ where: { name: username } });
                                        if (!user) {
                                            res.statusCode = 404;
                                            res.end(JSON.stringify({ error: 'User not found' }));
                                            return;
                                        }
                                        const newEvent = await prisma.agendaEvent.create({
                                            data: {
                                                title,
                                                description: description || null,
                                                date,
                                                time: time || null,
                                                userId: user.id
                                            },
                                            include: { user: { select: { name: true, image: true } } }
                                        });
                                        res.end(JSON.stringify(newEvent));
                                    } catch (e) {
                                        res.statusCode = 400;
                                        res.end(JSON.stringify({ error: e.message }));
                                    }
                                });
                                return;
                            }

                            // DELETE /api/agenda/:id
                            if (req.url.startsWith('/api/agenda/') && req.method === 'DELETE') {
                                const id = req.url.split('/').pop();
                                await prisma.agendaEvent.delete({ where: { id } });
                                res.end(JSON.stringify({ success: true }));
                                return;
                            }

                            // GET /api/games (Proxy to freetogame API)
                            if (req.url.startsWith('/api/games') && req.method === 'GET') {
                                const urlObj = new URL(req.url, 'http://localhost');
                                const platform = urlObj.searchParams.get('platform');
                                const sortBy = urlObj.searchParams.get('sort-by');
                                
                                let url = "https://www.freetogame.com/api/games";
                                const params = [];
                                if (platform && platform !== "all") params.push(`platform=${platform}`);
                                if (sortBy && sortBy !== "relevance") params.push(`sort-by=${sortBy}`);
                                
                                if (params.length > 0) {
                                    url += `?${params.join("&")}`;
                                }

                                try {
                                    const response = await fetch(url);
                                    if (!response.ok) throw new Error("External API response was not ok");
                                    const data = await response.json();
                                    res.end(JSON.stringify(data));
                                } catch (e) {
                                    res.statusCode = 500;
                                    res.end(JSON.stringify({ error: "Failed to fetch games from external API: " + e.message }));
                                }
                                return;
                            }

                            // GET /api/posts (Fetch all posts or filtered by username query)
                            if (req.url.startsWith('/api/posts') && req.method === 'GET') {
                                const urlObj = new URL(req.url, 'http://localhost');
                                const username = urlObj.searchParams.get('username');
                                const isAnnouncement = urlObj.searchParams.get('isAnnouncement');
 
                                let posts;
                                if (username) {
                                    posts = await prisma.post.findMany({
                                        where: {
                                            user: {
                                                name: username
                                            }
                                        },
                                        orderBy: {
                                            createdAt: 'desc'
                                        },
                                        include: {
                                            user: {
                                                select: { name: true, image: true }
                                            }
                                        }
                                    });
                                } else if (isAnnouncement === 'true') {
                                    posts = await prisma.post.findMany({
                                        where: {
                                            isAnnouncement: true
                                        },
                                        orderBy: {
                                            createdAt: 'desc'
                                        },
                                        include: {
                                            user: {
                                                select: { name: true, image: true }
                                            }
                                        }
                                    });
                                } else {
                                    posts = await prisma.post.findMany({
                                        where: {
                                            isAnnouncement: false // Don't show announcements in regular feed by default? Or show them?
                                            // The user asked to make announcements in the announcement page.
                                            // Let's hide them from regular feed to make the page special, or show them?
                                            // Let's filter them out of regular feed if not requested.
                                        },
                                        orderBy: {
                                            createdAt: 'desc'
                                        },
                                        include: {
                                            user: {
                                                select: { name: true, image: true }
                                            }
                                        }
                                    });
                                }
                                res.end(JSON.stringify(posts));
                                return;
                            }

                            // POST /api/posts (Create a new post associated with a user name)
                            if (req.url === '/api/posts' && req.method === 'POST') {
                                let body = '';
                                req.on('data', chunk => body += chunk);
                                req.on('end', async () => {
                                    try {
                                        const { username, text, image, isAnnouncement } = JSON.parse(body);
                                        if (!username || !text) {
                                            res.statusCode = 400;
                                            res.end(JSON.stringify({ error: 'Username and text content are required' }));
                                            return;
                                        }
                                        const dbUser = await prisma.user.findUnique({ where: { name: username } });
                                        if (!dbUser) {
                                            res.statusCode = 404;
                                            res.end(JSON.stringify({ error: 'User not found' }));
                                            return;
                                        }
                                        const images = image ? [image] : [];
                                        const newPost = await prisma.post.create({
                                            data: {
                                                text,
                                                images,
                                                isAnnouncement: isAnnouncement || false,
                                                userId: dbUser.id
                                            },
                                            include: {
                                                user: {
                                                    select: { name: true, image: true }
                                                }
                                            }
                                        });
                                        res.end(JSON.stringify(newPost));
                                    } catch (e) {
                                        res.statusCode = 400;
                                        res.end(JSON.stringify({ error: e.message }));
                                    }
                                });
                                return;
                            }

                            // DELETE /api/posts/:id
                            if (req.url.startsWith('/api/posts/') && req.method === 'DELETE') {
                                const id = req.url.split('/').pop();
                                await prisma.post.delete({ where: { id } });
                                res.end(JSON.stringify({ success: true }));
                                return;
                            }
                        } catch (err) {
                            res.statusCode = 500
                            res.end(JSON.stringify({ error: err.message }))
                            return
                        }
                    }
                    next()
                })
            }
        }
    ],
})
