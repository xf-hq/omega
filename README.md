# XF: Omega

This has been intended as a suite of automation tools for Cyberpunk 2077 modding. The codebase is ... dodgy. In various ways. There is a lot of "quick and dirty" in it, and this is largely due to me using the code as a way of learning how to mod the game. The purpose of the code has been to serve that need, and so while I would normally approach the structure and design of a codebase in a somewhat meticulous manner, in this case I took a more "just do what you need right now" kind of approach.

Embedded within this codebase is my first contribution to the modding community (WIP at this stage). I picked an arbitrary subject to learn with - something that seemed neglected as far as mod support goes - and I chose it because I thought it would be a simple enough way to learn the ropes. How foolish I was. Sometimes complexity is disguised as simplicity. The attempt has taught me much, though it only scratches the surface of what else there is to learn. Anyway, the mod is called "xf eye artistry ccxl" ("xf" as a shortening of "axefrog"). It's an eye makeup mod for female V, and supports multiple eye makeup layers with custom switchers added to the character creator, as well as many custom materials generated from scratch.

Now, again with the disclaimer _beware the jank! much jank be here!_ do the following:

1. Make yourself a code directory if you don't have one already. Mine is at `D:\dev`.
2. Clone this repository there. In my case that would end up with this README file appearing in `D:\dev\xf-omega`.
3. Alongside it, also clone my other project "xf common", which is a dependency for this one. You can get it at https://github.com/xf-hq/common.ts. I don't like that I called it "common.ts", but I haven't gotten around to changing it. I just rename it to "xf-common" after cloning it. In any case, for my setup that would give me `D:\dev\xf-common`.
4. Install:
   - Bun: https://bun.sh
   - Visual Studio Code: https://code.visualstudio.com/
5. Within the `xf-omega` codebase, modify the source file `my-config.ts` and fill in your own details. Note that the assets it's referring to are included in the `xf-omega` repository's `assets` folder, so you can just point there as needed.
6. From the command line (I use PowerShell myself):
   - Make sure you installed bun properly: `bun -v` - if that works, you're all good.
   - `cd D:\dev\xf-omega` (or wherever you ended up cloning this to).
   - `bun run --watch .\source\projects\xf-eye-artistry-ccxl\watch.ts`

If step 6 works without throwing a tantrum, you should see it starting to build the mod.
