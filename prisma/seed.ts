import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')

  // --- 1. User Model (Enabled) ---
  const passwordHash = await hash('admin@MPT123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@me-prompt.com' },
    update: {},
    create: {
      email: 'admin@me-prompt.com',
      name: 'Super Admin',
      passwordHash,
      role: 'admin',
      isActive: true,
      isVerified: true,
      position: 'admin',
      phone: '000-000-0000',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  console.log('Created user:', admin.email)

  // --- 2. Member Model (Commented template) ---
  /*
  const member = await prisma.member.create({
    data: {
      slug: 'member-slug',
      isActive: true,
      department: 'Engineering',
      title: 'Senior Developer',
      bio: 'A passionate developer.',
      photo: 'path/to/photo.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
      name: {
        display: 'Dev One',
        first: 'Dev',
        last: 'One'
      },
      socials: {
        facebook: '',
        github: '',
        instagram: '',
        linkedin: '',
        website: ''
      }
    }
  })
  console.log('Created member:', member.slug)
  */

  // --- 3. Intern Model (Commented template) ---
  /*
  const intern = await prisma.intern.create({
    data: {
        studentId: '64000000',
        portfolioSlug: 'intern-slug',
        status: 'Active',
        coopType: 'Full-time',
        faculty: 'Engineering',
        major: 'Computer Engineering',
        university: 'University Name',
        gen: '1',
        avatar: 'path/to/avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
        name: {
            display: 'Intern One',
            first: 'Intern',
            last: 'One'
        },
        contact: {
            email: 'intern@example.com',
            phone: '000-000-0000'
        },
        resume: {
            links: [
                { label: 'Resume', url: 'https://example.com/resume.pdf' }
            ]
        }
    }
  })
  console.log('Created intern:', intern.portfolioSlug)
  */

  // --- 4. Project Model (Commented template) ---
  /*
  const project = await prisma.project.create({
    data: {
        slug: 'project-alpha',
        title: 'Project Alpha',
        description: 'First big project',
        summary: 'Short summary',
        status: 'In Progress',
        featured: true,
        color: '#ff0000',
        isCustomColor: false,
        cover: 'path/to/cover.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
        internalProgress: 0
    }
  })
  console.log('Created project:', project.slug)
  */

  // --- 5. Partner Model (Commented template) ---
  /*
  const partner = await prisma.partner.create({
    data: {
        name: 'Partner Corp',
        description: 'A great partner',
        logo: 'path/to/logo.png',
        website: 'https://partner.com',
        status: 'Active',
        type: 'Sponsor',
        createdAt: new Date(),
        updatedAt: new Date()
    }
  })
  console.log('Created partner:', partner.name)
  */

  // --- 6. ProjectBoard Model (Commented template) ---
  /*
  const board = await prisma.projectBoard.create({
    data: {
        name: 'Main Board',
        description: 'Task board for main project',
        visibility: 'private',
        color: '#00ff00',
        createdAt: new Date(),
        updatedAt: new Date()
    }
  })
  console.log('Created board:', board.name)
  */
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
