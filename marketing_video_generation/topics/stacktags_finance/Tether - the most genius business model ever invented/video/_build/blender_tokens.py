# Build the falling-token scene: turquoise coins drop under gravity onto an
# invisible floor and STACK realistically (rigid-body sim). Render a portrait
# (1080x1920) transparent PNG sequence to composite over the grid + $100B counter.
import bpy, random, math, mathutils, os
random.seed(11)

sc = bpy.context.scene
sc.render.engine = 'BLENDER_EEVEE_NEXT'
sc.render.resolution_x = 1080
sc.render.resolution_y = 1920
sc.render.resolution_percentage = 100
sc.render.film_transparent = True
sc.frame_start = 1
sc.frame_end = 96
sc.render.fps = 24

# ---- camera: look down at the pile, portrait framing ----
cam = sc.camera
cam.location = (0.0, -8.2, 5.6)
direction = mathutils.Vector((0, 0, 1.0)) - cam.location
cam.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
cam.data.lens = 40

# ---- light: brighten the existing light + add world ambient ----
if sc.world is None:
    sc.world = bpy.data.worlds.new('W')
sc.world.use_nodes = True
bg = sc.world.node_tree.nodes.get('Background')
if bg:
    bg.inputs[0].default_value = (1, 1, 1, 1)
    bg.inputs[1].default_value = 0.7
lt = bpy.data.objects.get('Light')
if lt and lt.data:
    lt.data.energy = 1500 if lt.data.type == 'POINT' else 5

# ---- invisible floor + containing walls (passive rigid bodies) ----
def passive(obj, fric=0.9, rest=0.05):
    bpy.context.view_layer.objects.active = obj
    bpy.ops.rigidbody.object_add(type='PASSIVE')
    obj.rigid_body.friction = fric; obj.rigid_body.restitution = rest
    obj.rigid_body.collision_shape = 'BOX'
    obj.hide_render = True

bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, 0))
passive(bpy.context.object)
for (x, y, sx, sy) in [(2.6, 0, 0.1, 3), (-2.6, 0, 0.1, 3), (0, 2.6, 3, 0.1), (0, -2.6, 3, 0.1)]:
    bpy.ops.mesh.primitive_cube_add(location=(x, y, 1.6))
    w = bpy.context.object; w.scale = (sx, sy, 1.8)
    passive(w)

# ---- coin material (brand turquoise) ----
mat = bpy.data.materials.new('Coin'); mat.use_nodes = True
b = mat.node_tree.nodes.get('Principled BSDF')
b.inputs['Base Color'].default_value = (0.18, 0.62, 0.55, 1)
b.inputs['Roughness'].default_value = 0.34
b.inputs['Metallic'].default_value = 0.25

# ---- coins: drop from staggered heights so they pile up over time ----
N = 26
for i in range(N):
    bpy.ops.mesh.primitive_cylinder_add(vertices=56, radius=0.62, depth=0.16,
        location=(random.uniform(-1.4, 1.4), random.uniform(-1.4, 1.4), 3.0 + i * 0.62))
    c = bpy.context.object; c.name = f'Coin{i}'
    bpy.ops.object.shade_smooth()
    c.rotation_euler = (random.uniform(-0.4, 0.4), random.uniform(-0.4, 0.4), random.uniform(0, 6.28))
    c.data.materials.append(mat)
    bpy.context.view_layer.objects.active = c
    bpy.ops.rigidbody.object_add(type='ACTIVE')
    c.rigid_body.collision_shape = 'CYLINDER'
    c.rigid_body.friction = 0.85; c.rigid_body.restitution = 0.04
    c.rigid_body.mass = 0.5; c.rigid_body.linear_damping = 0.06; c.rigid_body.angular_damping = 0.2

# ---- rigid-body world: bake ----
rw = sc.rigidbody_world
rw.point_cache.frame_start = 1
rw.point_cache.frame_end = 96
rw.substeps_per_frame = 12
rw.solver_iterations = 12
bpy.ops.ptcache.bake_all(bake=True)

# ---- render ----
out = os.path.join(os.path.dirname(bpy.data.filepath), '_build', 'tokenfall', 'f_')
sc.render.image_settings.file_format = 'PNG'
sc.render.image_settings.color_mode = 'RGBA'
sc.render.filepath = out
bpy.ops.render.render(animation=True)
print('RENDER DONE ->', out)
