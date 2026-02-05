/// <reference types="astro/client" />

import type { User } from './middleware';

declare namespace App {
  interface Locals {
    user: User;
  }
}
