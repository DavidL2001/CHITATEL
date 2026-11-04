import { renderAppIcon } from '@/features/app/appIcon';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return renderAppIcon(size.width, 0.08);
}
