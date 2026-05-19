import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

const prisma = globalThis.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

const app = express()

// Enable CORS for frontend
app.use(cors())

// Parse JSON bodies (limit increased for base64 file uploads)
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Helper for sending errors
const sendError = (res, statusCode, message) => {
    res.status(statusCode).json({ error: message })
}

// Ensure Admin Exists (Runs lazily on first hit, or can be run on boot)
let adminSeeded = false
async function ensureAdminExists() {
    if (adminSeeded) return
    try {
        const count = await prisma.user.count()
        if (count === 0) {
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
            console.log('Seeded default admin user!')
        }
        adminSeeded = true
    } catch (err) {
        console.error('Error seeding admin user:', err)
    }
}

// Middleware to ensure admin seeding before any route
app.use(async (req, res, next) => {
    await ensureAdminExists()
    next()
})

// --- API ROUTES ---

// GET /api/users
app.get('/api/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, role: true, image: true, banner: true, description: true, active: true }
        })
        res.json(users)
    } catch (e) {
        sendError(res, 500, e.message)
    }
})

// POST /api/users (Add account from admin panel)
app.post('/api/users', async (req, res) => {
    try {
        const data = req.body
        if (!data.name || !data.password) return sendError(res, 400, 'Username and Password are required')
        
        const existing = await prisma.user.findUnique({ where: { name: data.name } })
        if (existing) return sendError(res, 400, 'User already exists')
        
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
        res.json(newUser)
    } catch (e) {
        sendError(res, 400, e.message)
    }
})

// POST /api/users/update
app.post('/api/users/update', async (req, res) => {
    try {
        const { currentUsername, newUsername, pfp, banner, description, email, password, theme, language } = req.body
        if (!currentUsername) return sendError(res, 400, 'Current username is required')
        
        let dataToUpdate = { image: pfp, banner, description, email, theme, language }
        if (newUsername) dataToUpdate.name = newUsername
        if (password) dataToUpdate.password = await bcrypt.hash(password, 10)

        // Clean undefined values
        Object.keys(dataToUpdate).forEach(key => dataToUpdate[key] === undefined && delete dataToUpdate[key])

        const updatedUser = await prisma.user.update({
            where: { name: currentUsername },
            data: dataToUpdate
        })
        
        res.json({
            name: updatedUser.name,
            role: updatedUser.role || 'USER',
            email: updatedUser.email || "",
            theme: updatedUser.theme || "default",
            language: updatedUser.language || "Español",
            pfp: updatedUser.image || "/tempuser/temporary_pfp.png",
            banner: updatedUser.banner || "/tempuser/temporary_banner.png",
            description: updatedUser.description || ""
        })
    } catch (e) {
        sendError(res, 400, e.message)
    }
})

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body
        const user = await prisma.user.findUnique({ where: { name: username } })
        if (!user) return sendError(res, 401, 'Credenciales inválidas / Invalid credentials')

        let isMatch = false
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
            isMatch = await bcrypt.compare(password, user.password)
        } else {
            isMatch = (user.password === password)
            if (isMatch) {
                const newHash = await bcrypt.hash(password, 10)
                await prisma.user.update({
                    where: { id: user.id },
                    data: { password: newHash }
                })
            }
        }

        if (!isMatch) return sendError(res, 401, 'Credenciales inválidas / Invalid credentials')

        res.json({
            name: user.name,
            role: user.role || 'USER',
            email: user.email || "",
            theme: user.theme || "default",
            language: user.language || "Español",
            pfp: user.image || "/tempuser/temporary_pfp.png",
            banner: user.banner || "/tempuser/temporary_banner.png",
            description: user.description || ""
        })
    } catch (e) {
        sendError(res, 400, e.message)
    }
})

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body
        if (!username || !password) return sendError(res, 400, 'Username and Password are required')
        
        const existing = await prisma.user.findUnique({ where: { name: username } })
        if (existing) return sendError(res, 400, 'El usuario ya existe / User already exists')
        
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await prisma.user.create({
            data: {
                name: username,
                password: hashedPassword,
                role: 'USER',
                active: true
            }
        })
        
        res.json({
            name: newUser.name,
            role: newUser.role || 'USER',
            email: newUser.email || "",
            theme: newUser.theme || "default",
            language: newUser.language || "Español",
            pfp: newUser.image || "/tempuser/temporary_pfp.png",
            banner: newUser.banner || "/tempuser/temporary_banner.png",
            description: newUser.description || ""
        })
    } catch (e) {
        sendError(res, 400, e.message)
    }
})

// GET /api/favorites/posts
app.get('/api/favorites/posts', async (req, res) => {
    try {
        const { username } = req.query
        if (!username) return sendError(res, 400, 'Username required')
        const user = await prisma.user.findUnique({ 
            where: { name: username }, 
            include: { likedPosts: { include: { user: { select: { name: true, image: true } } }, orderBy: { createdAt: 'desc' } } } 
        })
        res.json(user?.likedPosts || [])
    } catch (e) { sendError(res, 500, e.message) }
})

// POST /api/favorites/posts
app.post('/api/favorites/posts', async (req, res) => {
    try {
        const { username, postId } = req.body
        const user = await prisma.user.findUnique({ where: { name: username }, include: { likedPosts: true } })
        if (!user) return sendError(res, 404, 'User not found')
        
        const isLiked = user.likedPosts.some(p => p.id === postId)
        if (isLiked) {
            await prisma.user.update({ where: { name: username }, data: { likedPosts: { disconnect: { id: postId } } } })
        } else {
            await prisma.user.update({ where: { name: username }, data: { likedPosts: { connect: { id: postId } } } })
        }
        res.json({ success: true, isLiked: !isLiked })
    } catch (e) { sendError(res, 400, e.message) }
})

// GET /api/favorites/media
app.get('/api/favorites/media', async (req, res) => {
    try {
        const { username } = req.query
        if (!username) return sendError(res, 400, 'Username required')
        const user = await prisma.user.findUnique({ 
            where: { name: username }, 
            include: { likedMedia: { orderBy: { createdAt: 'desc' } } } 
        })
        res.json(user?.likedMedia || [])
    } catch (e) { sendError(res, 500, e.message) }
})

// POST /api/favorites/media
app.post('/api/favorites/media', async (req, res) => {
    try {
        const { username, media } = req.body
        const user = await prisma.user.findUnique({ where: { name: username }, include: { likedMedia: true } })
        if (!user) return sendError(res, 404, 'User not found')
        
        const existing = user.likedMedia.find(m => m.externalId === String(media.id))
        if (existing) {
            await prisma.favoriteMedia.delete({ where: { id: existing.id } })
            res.json({ success: true, isLiked: false })
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
            })
            res.json({ success: true, isLiked: true })
        }
    } catch (e) { sendError(res, 400, e.message) }
})

// GET /api/downloads
app.get('/api/downloads', async (req, res) => {
    try {
        const downloads = await prisma.downloadItem.findMany({
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, image: true } } }
        })
        res.json(downloads)
    } catch (e) { sendError(res, 500, e.message) }
})

// POST /api/downloads
app.post('/api/downloads', async (req, res) => {
    try {
        const { username, title, description, base64 } = req.body
        if (!username || !title || !base64) return sendError(res, 400, 'Username, title, and file data are required')
        
        const user = await prisma.user.findUnique({ where: { name: username } })
        if (!user) return sendError(res, 404, 'User not found')

        // Using /tmp directory on Vercel for temporary file storage (Note: Vercel files are ephemeral)
        // Alternatively, since Vercel is stateless, we shouldn't save files locally, but since it's a workaround for now:
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true })
        }

        const matches = base64.match(/^data:(.+);base64,(.+)$/)
        if (!matches || matches.length !== 3) return sendError(res, 400, 'Invalid base64 format')
        
        const fileData = matches[2]
        const buffer = Buffer.from(fileData, 'base64')
        const safeTitle = title.replace(/[^a-zA-Z0-9.\-_ ]/g, '_')
        const fileName = `${Date.now()}-${safeTitle}`
        const filePath = path.join(uploadsDir, fileName)

        fs.writeFileSync(filePath, buffer)
        const fileUrl = `/uploads/${fileName}`

        const newDownload = await prisma.downloadItem.create({
            data: { title, description: description || null, fileUrl, userId: user.id },
            include: { user: { select: { name: true, image: true } } }
        })
        res.json(newDownload)
    } catch (e) { sendError(res, 400, e.message) }
})

// DELETE /api/downloads/:id
app.delete('/api/downloads/:id', async (req, res) => {
    try {
        const { id } = req.params
        const item = await prisma.downloadItem.findUnique({ where: { id } })
        if (item && item.fileUrl) {
            const filePath = path.join(process.cwd(), 'public', item.fileUrl)
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
        }
        await prisma.downloadItem.delete({ where: { id } })
        res.json({ success: true })
    } catch (e) { sendError(res, 500, e.message) }
})

// GET /api/agenda
app.get('/api/agenda', async (req, res) => {
    try {
        const events = await prisma.agendaEvent.findMany({
            orderBy: { date: 'asc' },
            include: { user: { select: { name: true, image: true } } }
        })
        res.json(events)
    } catch (e) { sendError(res, 500, e.message) }
})

// POST /api/agenda
app.post('/api/agenda', async (req, res) => {
    try {
        const { username, title, description, date, time } = req.body
        if (!username || !title || !date) return sendError(res, 400, 'Username, title, and date are required')
        
        const user = await prisma.user.findUnique({ where: { name: username } })
        if (!user) return sendError(res, 404, 'User not found')
        
        const newEvent = await prisma.agendaEvent.create({
            data: { title, description: description || null, date, time: time || null, userId: user.id },
            include: { user: { select: { name: true, image: true } } }
        })
        res.json(newEvent)
    } catch (e) { sendError(res, 400, e.message) }
})

// DELETE /api/agenda/:id
app.delete('/api/agenda/:id', async (req, res) => {
    try {
        const { id } = req.params
        await prisma.agendaEvent.delete({ where: { id } })
        res.json({ success: true })
    } catch (e) { sendError(res, 500, e.message) }
})

// GET /api/games
app.get('/api/games', async (req, res) => {
    try {
        const { platform, 'sort-by': sortBy } = req.query
        let url = "https://www.freetogame.com/api/games"
        const params = []
        if (platform && platform !== "all") params.push(`platform=${platform}`)
        if (sortBy && sortBy !== "relevance") params.push(`sort-by=${sortBy}`)
        if (params.length > 0) url += `?${params.join("&")}`

        const response = await fetch(url)
        if (!response.ok) throw new Error("External API response was not ok")
        const data = await response.json()
        res.json(data)
    } catch (e) { sendError(res, 500, e.message) }
})

// GET /api/posts
app.get('/api/posts', async (req, res) => {
    try {
        const { username, isAnnouncement } = req.query
        let whereClause = {}
        if (username) {
            whereClause = { user: { name: username } }
        } else if (isAnnouncement === 'true') {
            whereClause = { isAnnouncement: true }
        } else {
            whereClause = { isAnnouncement: false }
        }

        const posts = await prisma.post.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, image: true } } }
        })
        res.json(posts)
    } catch (e) { sendError(res, 500, e.message) }
})

// POST /api/posts
app.post('/api/posts', async (req, res) => {
    try {
        const { username, text, image, isAnnouncement } = req.body
        if (!username || !text) return sendError(res, 400, 'Username and text are required')
        
        const dbUser = await prisma.user.findUnique({ where: { name: username } })
        if (!dbUser) return sendError(res, 404, 'User not found')
        
        const images = image ? [image] : []
        const newPost = await prisma.post.create({
            data: { text, images, isAnnouncement: isAnnouncement || false, userId: dbUser.id },
            include: { user: { select: { name: true, image: true } } }
        })
        res.json(newPost)
    } catch (e) { sendError(res, 400, e.message) }
})

// DELETE /api/posts/:id
app.delete('/api/posts/:id', async (req, res) => {
    try {
        const { id } = req.params
        await prisma.post.delete({ where: { id } })
        res.json({ success: true })
    } catch (e) { sendError(res, 500, e.message) }
})

export default app
