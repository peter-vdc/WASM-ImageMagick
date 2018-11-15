import { buildInputFile, compare, extractInfo, execute, executeOne } from '../src'

export default describe('execute', () => {

  describe('executeOne', () => {
    it('should run convert -resize', async done => {
      const img1 = await buildInputFile('holocaust.jpg')
      let info = await extractInfo(img1)
      expect(info[0].image.formatDescription.toLowerCase()).toBe('jpeg')
      expect(info[0].image.geometry.width).toBe(320)
      expect(info[0].image.geometry.height).toBe(240)

      const { outputFiles } = await executeOne({
        inputFiles: [img1],
        commands: [['convert', 'holocaust.jpg', '-resize', '123x321!', 'resized.png']],
      })
      info = await extractInfo(outputFiles[0])
      expect(info[0].image.formatDescription.toLowerCase()).toBe('png')
      expect(info[0].image.geometry.width).toBe(123)
      expect(info[0].image.geometry.height).toBe(321)
      done()
    })

    it('should support CLI like commands', async done => {
      const img1 = await buildInputFile('holocaust.jpg')
      const { outputFiles } = await executeOne({ inputFiles: [img1], commands: ['convert holocaust.jpg -resize 444x76! output.gif'] })
      expect(outputFiles[0].name).toBe('output.gif')
      const info = await extractInfo(outputFiles[0])
      expect(info[0].image.formatDescription.toLowerCase()).toBe('gif')
      expect(info[0].image.geometry.width).toBe(444)
      expect(info[0].image.geometry.height).toBe(76)
      done()
    })

    it('should return error property and empty outputFiles on error', async done => {
      const { outputFiles, errors, exitCode, stderr } = await executeOne({ inputFiles: [await buildInputFile('fn.png')], commands: `convert nonExistent.png out.tiff` })
      expect(exitCode).not.toBe(0)
      expect(outputFiles.length).toBe(0)
      expect(stderr.join('\n')).toContain(`'nonExistent.png': No such file or directory`)
      expect(errors.length).toBe(1)
      done()
    })
  })

  describe('execute', () => {
    it('should execute commands serially and output files are available to next commands', async done => {
      const result = await execute({
        inputFiles: [await buildInputFile('fn.png', 'image1.png')],
        commands: [
          ['convert', 'image1.png', '-rotate', '70', 'image2.gif'],
          // heads up: next command uses 'image2.gif' which was the output of previous command:
          ['convert', 'image2.gif', '-scale', '23%', 'image3.jpg'],
        ],
      })
      const result2 = await executeOne({
        inputFiles: [await buildInputFile('fn.png', 'image1.png')],
        commands: [['convert', 'image1.png', '-rotate', '70', '-scale', '23%', 'image2.gif']],
      })
      expect(await compare(result.outputFiles.find(f => f.name === 'image3.jpg'), result2.outputFiles[0])).toBe(true)
      done()
    })

    it('supports CLI like commands', async done => {
      const { outputFiles } = await execute({
        inputFiles: [await buildInputFile('fn.png', 'image1.png')],
        commands: [
          'convert image1.png -rotate 70 image2.gif',
          // heads up: the next command uses 'image2.gif' which was the output of previous command:
          'convert image2.gif -scale 23% image3.jpg',
        ],
      })
      const result2 = await executeOne({
        inputFiles: [await buildInputFile('fn.png', 'image1.png')],
        commands: ['convert image1.png -rotate 70 -scale 23% image2.gif'],
      })
      expect(await compare(outputFiles.find(f => f.name === 'image3.jpg'), result2.outputFiles[0])).toBe(true)
      done()
    })

    it('supports single string CLI like command', async done => {
      const { outputFiles } = await execute({
        inputFiles: [await buildInputFile('fn.png', 'image1.png')],
        commands: 'convert image1.png -rotate 70 image2.gif',
      })
      expect(outputFiles[0].name).toBe('image2.gif')
      done()
    })

    describe('errors', () => {

      it('should return error property and empty outputFiles on error', async done => {
        const img = await buildInputFile('fn.png')
        const result = await execute({ inputFiles: [img], commands: `convert nonExistent.png out.tiff` })
        expect(result.outputFiles.length).toBe(0)
        expect(result.results.length).toBe(1)
        expect(result.stderr.join('\n')).toContain(`'nonExistent.png': No such file or directory`)
        expect(result.errors.length).toBe(1)

        expect(result.results[0].exitCode).not.toBe(0)
        expect(result.results[0].stderr.join('\n')).toContain(`'nonExistent.png': No such file or directory`)
        done()
      })

      it('should return errors per command', async done => {
        const img = await buildInputFile('fn.png')
        const result = await execute({
          inputFiles: [img], commands: [
            `convert fn.png out.gif`,
            `convert nonExistent.png out.tiff`,
            `convert out.gif foo.png`,
            `identify rose:`,
          ],
        })
        expect(result.outputFiles.length).toBe(2)
        expect(result.errors.length).toBe(4)
        expect(result.errors[0]).toBeUndefined()
        expect(result.errors[1]).toBeDefined()
        expect(result.errors[2]).toBeUndefined()
        expect(result.errors[3]).toBeUndefined()

        expect(result.stdout.join('\n')).toContain(`rose:=>ROSE PNM 70x46 70x46+0+0 8-bit`)
        expect(result.stderr.join('\n')).toContain(`'nonExistent.png': No such file or directory`)

        expect(result.results[3].stdout.join('\n')).toContain(`rose:=>ROSE PNM 70x46 70x46+0+0 8-bit`)
        expect(result.results[3].errors[0]).toBeUndefined()

        expect(result.results[1].errors[0]).toBeDefined()
        expect(result.results[1].stderr.join('\n')).toContain(`'nonExistent.png': No such file or directory`)

        done()
      })
    })
  })

  xit('event emitter', () => { })
})
