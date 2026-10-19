import Box from '@mui/material/Box';
import logo from '@/assets/gsk-logo.png';

/** GSK wordmark. Width drives size; the image keeps its aspect ratio. */
export function GskLogo({ width = 96 }: { width?: number }) {
  return <Box component="img" src={logo} alt="GSK" sx={{ width, height: 'auto', display: 'block' }} />;
}
