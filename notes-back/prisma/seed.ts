import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'demo@docket.app' },
    update: {},
    create: {
      email: 'demo@docket.app',
      password: hashedPassword,
      name: 'Demo User',
    },
  })

  console.log(`Created user: ${user.email}`)

  // Create demo notes
  const notes = [
    {
      title: 'This is Docket note.',
      content: 'A simple and clean note-taking app that helps you organize your thoughts.',
      color: 'yellow',
    },
    {
      title: 'The beginning of screenless design',
      content: 'UI jobs to be taken over by Solution Architect. The future of design is moving beyond screens.',
      color: 'yellow',
    },
    {
      title: '13 Things You Should Give Up If You Want To Be a Successful UX Designer',
      content: 'Key principles every UX designer should follow to improve their craft and career.',
      color: 'orange',
    },
    {
      title: '10 UI & UX Lessons from Product Design',
      content: 'Important lessons learned from years of building products for users.',
      color: 'purple',
    },
    {
      title: '52 Research Terms you need to know as a UX Designer',
      content: 'A comprehensive glossary of research terminology for UX professionals.',
      color: 'green',
    },
    {
      title: 'Text fields & Forms design — UI components',
      content: 'Best practices for designing text fields and forms in modern UI.',
      color: 'blue',
    },
  ]

  for (const note of notes) {
    await prisma.note.create({
      data: {
        ...note,
        userId: user.id,
      },
    })
  }

  console.log(`Created ${notes.length} demo notes`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
