import { execa } from 'execa'

export async function probe(path: string) {
  const { stdout } = await execa(process.env.FFPROBE_PATH || 'ffprobe', [
    '-v','error','-show_entries','stream=codec_name,width,height','-of','json', path
  ])
  return JSON.parse(stdout)
}
