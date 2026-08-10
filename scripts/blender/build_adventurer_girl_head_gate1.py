"""Build Gate 1 editable head bust and matched QA renders in Blender 5.2.

Run:
  Blender --background --python scripts/blender/build_adventurer_girl_head_gate1.py
"""
from pathlib import Path
import bpy
import math
import os
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
GATE_VERSION = os.environ.get("ADVENTURER_HEAD_GATE", "gate1")
GATE11 = GATE_VERSION == "gate1-1"
GATE12 = GATE_VERSION == "gate1-2"
GATE13 = GATE_VERSION == "gate1-3"
GATE14 = GATE_VERSION == "gate1-4"
OUT = ROOT / "artwork" / "blender" / f"adventurer-girl-head-{GATE_VERSION}"
OUT.mkdir(parents=True, exist_ok=True)


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials,
                       bpy.data.cameras, bpy.data.lights):
        for block in list(datablocks):
            if block.users == 0:
                datablocks.remove(block)


def material(name, color, roughness=0.72):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1.0)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    return mat


def collection(name, parent=None):
    col = bpy.data.collections.new(name)
    (parent or bpy.context.scene.collection).children.link(col)
    return col


def link_object(obj, col):
    for old in list(obj.users_collection):
        old.objects.unlink(obj)
    col.objects.link(obj)


def custom_ellipsoid(name, loc, scale, mat, col, rings=18, segments=32,
                     front_soften=0.0, jaw=0.0):
    """Closed quad topology, authored directly rather than importing a primitive."""
    verts, faces = [], []
    for r in range(rings + 1):
        phi = -math.pi / 2 + math.pi * r / rings
        zunit = math.sin(phi)
        radial = math.cos(phi)
        # Fuller upper cranium, soft cheek, tapered lower jaw.
        width = 1.0
        if jaw and zunit < -0.05:
            width *= 1.0 - jaw * ((-zunit - 0.05) / 0.95) ** 1.3
        if jaw and -0.55 < zunit < -0.05:
            width *= 1.035
        for s in range(segments):
            theta = 2 * math.pi * s / segments
            x = radial * math.cos(theta) * scale[0] * width
            y = radial * math.sin(theta) * scale[1]
            # Front is -Y. Flatten forehead slightly; preserve cheek projection.
            if y < 0 and front_soften:
                y *= 1.0 - front_soften * max(zunit, 0.0)
            z = zunit * scale[2]
            verts.append((loc[0] + x, loc[1] + y, loc[2] + z))
    for r in range(rings):
        for s in range(segments):
            a = r * segments + s
            b = r * segments + (s + 1) % segments
            c = (r + 1) * segments + (s + 1) % segments
            d = (r + 1) * segments + s
            faces.append((a, b, c, d))
    mesh = bpy.data.meshes.new(name + "_Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    col.objects.link(obj)
    obj.data.materials.append(mat)
    for p in mesh.polygons:
        p.use_smooth = True
    bevel = obj.modifiers.new("Edge_Soften", "BEVEL")
    bevel.width, bevel.segments = 0.008, 2
    return obj


def tube_lock(name, points, widths, depths, mat, col):
    """A closed, tapered 8-vertex-per-section hair lock mesh."""
    verts, faces = [], []
    n = 10
    for i, p in enumerate(points):
        tangent = Vector(points[min(i + 1, len(points)-1)]) - Vector(points[max(i-1, 0)])
        tangent.normalize()
        side = tangent.cross(Vector((0, 1, 0)))
        if side.length < 0.1:
            side = Vector((1, 0, 0))
        side.normalize()
        normal = tangent.cross(side).normalized()
        for k in range(n):
            a = 2 * math.pi * k / n
            v = Vector(p) + side * math.cos(a) * widths[i] + normal * math.sin(a) * depths[i]
            verts.append(tuple(v))
    for i in range(len(points)-1):
        for k in range(n):
            faces.append((i*n+k, i*n+(k+1)%n, (i+1)*n+(k+1)%n, (i+1)*n+k))
    faces.append(tuple(reversed(range(n))))
    faces.append(tuple((len(points)-1)*n+k for k in range(n)))
    mesh = bpy.data.meshes.new(name + "_Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    col.objects.link(obj)
    obj.data.materials.append(mat)
    for p in mesh.polygons:
        p.use_smooth = True
    subdiv = obj.modifiers.new("Lock_Subdivision", "SUBSURF")
    subdiv.levels = subdiv.render_levels = 2
    bevel = obj.modifiers.new("Lock_Soften", "BEVEL")
    bevel.width, bevel.segments = 0.012, 2
    return obj


def ribbon_lock(name, points, widths, depths, mat, col):
    """Broad closed hair ribbon with its root buried in the cap and a sharp tip."""
    verts, faces = [], []
    for p, w, d in zip(points, widths, depths):
        verts.extend([(p[0]-w, p[1]-d, p[2]), (p[0]+w, p[1]-d, p[2]),
                      (p[0]-w, p[1]+d, p[2]), (p[0]+w, p[1]+d, p[2])])
    for i in range(len(points)-1):
        a, b = i*4, (i+1)*4
        faces.extend([(a,b,b+1,a+1), (a+2,a+3,b+3,b+2),
                      (a,a+2,b+2,b), (a+1,b+1,b+3,a+3)])
    faces.extend([(0,1,3,2), tuple(range((len(points)-1)*4, len(points)*4))])
    mesh = bpy.data.meshes.new(name + "_Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    col.objects.link(obj)
    obj.data.materials.append(mat)
    for poly in mesh.polygons:
        poly.use_smooth = True
    sub = obj.modifiers.new("Ribbon_Subdivision", "SUBSURF")
    sub.levels = sub.render_levels = 2
    return obj


def lid_band(name, x, y, outer_z, inner_z, mat, col):
    """Skin surface band defining an anime upper eyelid opening, not a line."""
    xs = (-0.29, -0.15, 0.0, 0.15, 0.29)
    verts = [(x+dx, y, z) for dx, z in zip(xs, outer_z)]
    verts += [(x+dx, y-0.004, z) for dx, z in zip(xs, inner_z)]
    faces = [(i, i+1, 6+i, 5+i) for i in range(4)]
    mesh = bpy.data.meshes.new(name + "_Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    col.objects.link(obj)
    obj.data.materials.append(mat)
    solid = obj.modifiers.new("Lid_Thickness", "SOLIDIFY")
    solid.thickness = 0.012
    bevel = obj.modifiers.new("Lid_Soften", "BEVEL")
    bevel.width, bevel.segments = 0.012, 3
    return obj


def flat_patch(name, coords, mat, col, thickness=0.008, bevel=0.006):
    mesh = bpy.data.meshes.new(name + "_Mesh")
    mesh.from_pydata(coords, [], [tuple(range(len(coords)))])
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    col.objects.link(obj)
    obj.data.materials.append(mat)
    solid = obj.modifiers.new("Surface_Thickness", "SOLIDIFY")
    solid.thickness = thickness
    soft = obj.modifiers.new("Surface_Soften", "BEVEL")
    soft.width, soft.segments = bevel, 3
    return obj


def almond_eye(name, x, y, z, width, height, mat, col):
    # Pointed eye corners and restrained upper opening, nearly flush to the face.
    coords = [(x-width,y,z), (x-width*.70,y-0.002,z+height*.62),
              (x,y-0.004,z+height), (x+width*.70,y-0.002,z+height*.62),
              (x+width,y,z), (x+width*.68,y-0.002,z-height*.48),
              (x,y-0.004,z-height*.63), (x-width*.68,y-0.002,z-height*.48)]
    return flat_patch(name, coords, mat, col, 0.007, 0.010)


def fringe_shell(name, mat, col):
    # One asymmetric cap-overlapping shell; the lower edge forms four soft scallops.
    perimeter = [(-1.00,-0.48,3.62),(-0.72,-0.30,3.82),(-0.30,-0.22,3.91),
                 (0.12,-0.20,3.93),(0.55,-0.28,3.84),(0.93,-0.48,3.61),
                 (0.88,-0.84,3.29),(0.69,-0.87,3.42),(0.48,-0.88,3.21),
                 (0.22,-0.89,3.43),(-0.04,-0.89,3.24),(-0.28,-0.88,3.46),
                 (-0.54,-0.87,3.23),(-0.76,-0.84,3.40)]
    obj = flat_patch(name, perimeter, mat, col, 0.045, 0.035)
    return obj


def wave_hair_cap(name, loc, scale, mat, col, levels=16, segments=40):
    """Continuous scalp cap whose own lower boundary is the asymmetric hairline."""
    verts, faces = [], []
    for s in range(segments):
        theta = 2*math.pi*s/segments
        front = max(0.0, -math.sin(theta)) ** 5
        xn = math.cos(theta)
        wave = (0.035*math.sin(3.2*xn*math.pi+0.4) + 0.025*xn) * front
        boundary_z = -0.76*(1-front) + (0.23+wave)*front
        phi_end = math.asin(max(-.90,min(.80,boundary_z)))
        for r in range(levels+1):
            phi = math.pi/2 + (phi_end-math.pi/2)*r/levels
            radial = math.cos(phi)
            verts.append((loc[0]+radial*math.cos(theta)*scale[0],
                          loc[1]+radial*math.sin(theta)*scale[1],
                          loc[2]+math.sin(phi)*scale[2]))
    for s in range(segments):
        ns=(s+1)%segments
        for r in range(levels):
            a=s*(levels+1)+r; b=ns*(levels+1)+r
            faces.append((a,b,b+1,a+1))
    mesh=bpy.data.meshes.new(name+"_Mesh")
    mesh.from_pydata(verts,[],faces); mesh.update()
    obj=bpy.data.objects.new(name,mesh); col.objects.link(obj); obj.data.materials.append(mat)
    for p in mesh.polygons: p.use_smooth=True
    solid=obj.modifiers.new("Cap_Thickness","SOLIDIFY"); solid.thickness=.035
    bevel=obj.modifiers.new("Hairline_Soften","BEVEL"); bevel.width=.018; bevel.segments=3
    return obj


def tapered_curve(name, points, radii, bevel, mat, col):
    curve=bpy.data.curves.new(name+"_Curve","CURVE")
    curve.dimensions="3D"; curve.resolution_u=4; curve.bevel_resolution=3; curve.bevel_depth=bevel
    spline=curve.splines.new("BEZIER"); spline.bezier_points.add(len(points)-1)
    for bp,co,rad in zip(spline.bezier_points,points,radii):
        bp.co=co; bp.radius=rad; bp.handle_left_type=bp.handle_right_type="AUTO"
    obj=bpy.data.objects.new(name,curve); col.objects.link(obj); obj.data.materials.append(mat)
    bpy.context.view_layer.objects.active=obj; obj.select_set(True); bpy.ops.object.convert(target="MESH"); obj.select_set(False)
    return obj


def curve_line(name, points, bevel, mat, col):
    curve = bpy.data.curves.new(name + "_Curve", "CURVE")
    curve.dimensions, curve.resolution_u, curve.bevel_resolution = "3D", 3, 3
    curve.bevel_depth = bevel
    spline = curve.splines.new("BEZIER")
    spline.bezier_points.add(len(points)-1)
    for bp, co in zip(spline.bezier_points, points):
        bp.co = co
        bp.handle_left_type = bp.handle_right_type = "AUTO"
    obj = bpy.data.objects.new(name, curve)
    col.objects.link(obj)
    obj.data.materials.append(mat)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target="MESH")
    obj.select_set(False)
    return obj


def camera(name, loc, target, lens=64):
    data = bpy.data.cameras.new(name)
    obj = bpy.data.objects.new(name, data)
    bpy.context.scene.collection.objects.link(obj)
    obj.location = loc
    obj.rotation_euler = (Vector(target)-Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    data.lens = lens
    return obj


clear_scene()
skin = material("MAT_Skin_Clay", (0.72, 0.57, 0.46))
white = material("MAT_Eye_White", (0.84, 0.82, 0.76), 0.55)
iris = material("MAT_Iris_Amber", (0.33, 0.17, 0.055), 0.48)
hair = material("MAT_Hair_CharcoalTeal", (0.055, 0.085, 0.085), 0.62)
line = material("MAT_Feature_Line", (0.045, 0.04, 0.035), 0.65)
coral = material("MAT_Cheek_Coral", (0.76, 0.34, 0.27), 0.78)
if GATE13 or GATE14:
    colors = {skin:(0.88,0.66,0.52), white:(0.96,0.93,0.84),
              iris:(0.58,0.28,0.055), hair:(0.035,0.14,0.15), line:(0.035,0.025,0.020)}
    for mat, color in colors.items():
        mat.diffuse_color = (*color,1)
        mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (*color,1)

root = collection("CHAR_AdventurerGirl_Head_Gate1")
anatomy = collection("01_Anatomy", root)
eyes = collection("02_Eyes", root)
hair_back = collection("03_Hair_Back", root)
hair_side = collection("04_Hair_Side", root)
hair_front = collection("05_Hair_Front", root)
features = collection("06_Face_Features", root)

# Face faces -Y. Lower half is tapered while cheeks stay full.
head = custom_ellipsoid("GEO_Head", (0,0,2.72) if (GATE11 or GATE12 or GATE13 or GATE14) else (0,0,2.68),
                        (1.10,0.88,1.06) if (GATE13 or GATE14) else ((1.09,0.88,1.06) if GATE12 else ((1.08,0.88,1.07) if GATE11 else (1.02,0.88,1.16))), skin, anatomy,
                        rings=22, segments=40, front_soften=0.13, jaw=0.16 if (GATE13 or GATE14) else (0.17 if GATE12 else (0.19 if GATE11 else 0.29)))
custom_ellipsoid("GEO_Ear_L", (-1.00, -0.01, 2.63), (0.20, 0.115, 0.34), skin, anatomy, 12, 20)
custom_ellipsoid("GEO_Ear_R", (1.00, -0.01, 2.63), (0.20, 0.115, 0.34), skin, anatomy, 12, 20)
custom_ellipsoid("GEO_Neck", (0, 0.14, 1.57), (0.38, 0.35, 0.62), skin, anatomy, 10, 24)

# Large vertical anime eyes, separated enough to avoid infant-like reading.
for side, x in (("L", -0.43), ("R", 0.43)):
    if GATE14:
        # Wider, lower almond with a subtly dropped outer corner.
        outer = -1 if side=="L" else 1
        coords=[(x-.33,-.846,2.73),(x-.23,-.849,2.88),(x,-.852,2.96),(x+.23,-.849,2.88),
                (x+.33,-.846,2.70),(x+.22,-.849,2.61),(x,-.852,2.58),(x-.22,-.849,2.61)]
        if side=="L":
            coords=[(2*x-vx,vy,vz) for vx,vy,vz in reversed(coords)]
        flat_patch(f"GEO_EyeSurface_{side}",coords,white,eyes,.007,.010)
        custom_ellipsoid(f"GEO_Iris_{side}",(x,-.861,2.69),(.125,.006,.172),iris,eyes,12,24)
        custom_ellipsoid(f"GEO_Pupil_{side}",(x,-.869,2.69),(.044,.004,.090),line,eyes,10,20)
        custom_ellipsoid(f"GEO_EyeHighlight_{side}",(x-.038,-.876,2.77),(.026,.003,.038),white,eyes,8,16)
        tapered_curve(f"GEO_UpperLash_{side}",[(x-.27,-.876,2.75),(x-.13,-.881,2.88),(x,-.883,2.92),(x+.14,-.881,2.87),(x+.28,-.876,2.72)],
                      [.25,.75,1,.68,.18],.024,line,eyes)
        tapered_curve(f"GEO_Brow_{side}",[(x-.17,-.858,3.08),(x,-.873,3.13),(x+.17,-.858,3.07)],
                      [.35,1,.25],.018,line,features)
        continue
    if GATE13:
        almond_eye(f"GEO_EyeSurface_{side}",x,-0.846,2.76,0.305,0.275,white,eyes)
        custom_ellipsoid(f"GEO_Iris_{side}",(x,-0.862,2.72),(0.125,0.006,0.185),iris,eyes,12,24)
        custom_ellipsoid(f"GEO_Pupil_{side}",(x,-0.870,2.72),(0.046,0.004,0.100),line,eyes,10,20)
        custom_ellipsoid(f"GEO_EyeHighlight_{side}",(x-0.042,-0.877,2.82),(0.029,0.003,0.045),white,eyes,8,16)
        curve_line(f"GEO_UpperLash_{side}",[(x-.30,-0.877,2.77),(x-.16,-0.884,2.94),
                   (x,-0.887,3.01),(x+.16,-0.884,2.94),(x+.30,-0.877,2.77)],0.025,line,eyes)
        brow_pts=[(x-.21,-0.862,3.17),(x,-0.879,3.23),(x+.21,-0.862,3.14)]
        curve_line(f"GEO_Brow_{side}",brow_pts,0.018,line,features)
        continue
    eye_loc = (x,-0.836,2.75) if GATE12 else ((x,-0.790,2.76) if GATE11 else (x,-0.755,2.78))
    eye_scale = (0.272,0.014,0.315) if GATE12 else ((0.270,0.072,0.330) if GATE11 else (0.285,0.105,0.355))
    iris_loc = (x,-0.852,2.71) if GATE12 else ((x,-0.865,2.72) if GATE11 else (x,-0.861,2.77))
    iris_scale = (0.135,0.008,0.190) if GATE12 else ((0.137,0.013,0.195) if GATE11 else (0.145,0.027,0.220))
    pupil_loc = (x,-0.861,2.71) if GATE12 else ((x,-0.879,2.72) if GATE11 else (x,-0.885,2.77))
    pupil_scale = (0.050,0.006,0.098) if GATE12 else ((0.052,0.012,0.102) if GATE11 else (0.058,0.017,0.118))
    custom_ellipsoid(f"GEO_Eyeball_{side}", eye_loc, eye_scale, white, eyes, 14, 28)
    custom_ellipsoid(f"GEO_Iris_{side}", iris_loc, iris_scale, iris, eyes, 12, 24)
    custom_ellipsoid(f"GEO_Pupil_{side}", pupil_loc, pupil_scale, line, eyes, 10, 20)
    if GATE12:
        lid_band(f"GEO_UpperLidSurface_{side}", x, -0.874,
                 (2.87,3.01,3.055,3.01,2.87), (2.82,2.91,2.935,2.91,2.82), skin, eyes)
        # Only a short outer-corner accent remains below; no independent lower-lid string.
        outer = -1 if side == "L" else 1
        curve_line(f"GEO_OuterEyeCorner_{side}", [(x+outer*.27,-0.872,2.76),
                   (x+outer*.30,-0.866,2.70)], 0.010, line, eyes)
        brow_pts = [(x-0.19,-0.861,3.19),(x,-0.878,3.25),(x+0.19,-0.861,3.19)]
    elif GATE11:
        # Dedicated eyelid rims overlap the upper iris to calm the neutral gaze.
        curve_line(f"GEO_UpperLid_{side}", [(x-0.255,-0.889,2.76),(x-0.13,-0.897,2.91),
                                             (x,-0.900,2.965),(x+0.13,-0.897,2.91),
                                             (x+0.255,-0.889,2.76)], 0.020, line, eyes)
        curve_line(f"GEO_LowerLid_{side}", [(x-0.225,-0.887,2.69),(x-0.11,-0.891,2.61),
                                             (x,-0.892,2.585),(x+0.11,-0.891,2.61),
                                             (x+0.225,-0.887,2.69)], 0.010, skin, eyes)
        brow_pts = [(x-0.20,-0.866,3.20), (x,-0.895,3.27), (x+0.20,-0.866,3.20)]
    else:
        brow_pts = [(x-0.20,-0.902,3.27), (x,-0.965,3.33), (x+0.20,-0.902,3.27)]
    curve_line(f"GEO_Brow_{side}", brow_pts, 0.024 if GATE11 else 0.027, line, features)

# Minimal nose and a calm, gently upturned mouth.
custom_ellipsoid("GEO_Nose", (0,-0.864,2.43), (0.033,0.022,0.040) if GATE14 else ((0.036,0.024,0.043) if GATE13 else ((0.043,0.030,0.050) if GATE12 else ((0.060,0.048,0.070) if GATE11 else (0.085,0.07,0.10)))), skin, features, 8, 16)
mouth_pts = [(-.12,-.850,2.19),(0,-.860,2.175),(.12,-.850,2.19)] if GATE14 else ([(-0.13,-0.851,2.19),(0,-0.861,2.17),(0.13,-0.851,2.19)] if GATE13 else ([(-0.14,-0.851,2.19),(0,-0.862,2.165),(0.14,-0.851,2.19)] if GATE12 else ([(-0.17,-0.858,2.17),(0,-0.875,2.135),(0.17,-0.858,2.17)] if GATE11 else [(-0.22,-0.862,2.12),(0,-0.91,2.08),(0.22,-0.862,2.12)])))
curve_line("GEO_Mouth", mouth_pts, 0.010 if GATE14 else (0.011 if GATE13 else (0.012 if GATE12 else (0.016 if GATE11 else 0.022))), line, features)
if GATE13:
    for side,x in (("L",-.61),("R",.61)):
        custom_ellipsoid(f"GEO_CheekPatch_{side}",(x,-0.805,2.43),(0.20,0.006,0.095),coral,features,8,20)

# Back cap and layered bob locks. Every visible region remains a named editable mesh.
if GATE14:
    wave_hair_cap("GEO_Hair_ContinuousCap",(0,.18,2.93),(1.14,.95,1.22),hair,hair_back)
else:
    custom_ellipsoid("GEO_Hair_BackCap", (0, 0.18, 2.93), (1.14, 0.95, 1.22), hair, hair_back,
                     20, 36, front_soften=0.02, jaw=0.12)
for i, x in enumerate((-0.88, -0.60, -0.30, 0.0, 0.30, 0.60, 0.88)):
    flare = 0.09 * (abs(x)/0.88)
    tube_lock(f"GEO_BackLock_{i+1:02d}", [(x*0.82, 0.66, 3.47), (x, 0.78, 2.70),
              (x + math.copysign(flare, x or 1), 0.42, 1.95)], [0.25, 0.28, 0.055],
              [0.15, 0.18, 0.045], hair, hair_back)

# Side locks frame the cheek but terminate outside the eye boxes.
for side, sx in (("L", -1), ("R", 1)):
    tube_lock(f"GEO_SideLock_{side}_A", [(0.78*sx, -0.12, 3.48), (1.02*sx, -0.42, 2.72),
              (0.93*sx, -0.32, 1.97)], [0.25, 0.22, 0.045], [0.14, 0.12, 0.035], hair, hair_side)
    tube_lock(f"GEO_SideLock_{side}_B", [(0.97*sx, 0.08, 3.31), (1.15*sx, 0.02, 2.55),
              (1.10*sx, 0.16, 2.08)], [0.22, 0.19, 0.045], [0.13, 0.11, 0.035], hair, hair_side)

# Five deliberate bangs leave both eyes completely visible and open the centre forehead.
bang_specs = ([
    ("L_sweep", [(-0.82,-0.30,3.62),(-0.72,-0.58,3.55),(-0.62,-0.78,3.42),(-0.55,-0.84,3.26)], .18),
    ("L_centre", [(-0.40,-0.42,3.72),(-0.32,-0.68,3.61),(-0.24,-0.86,3.47),(-0.18,-0.88,3.30)], .17),
    ("R_centre", [(0.12,-0.43,3.74),(0.17,-0.69,3.62),(0.23,-0.86,3.48),(0.29,-0.88,3.31)], .16),
    ("R_sweep", [(0.50,-0.35,3.68),(0.60,-0.60,3.57),(0.68,-0.79,3.43),(0.73,-0.82,3.25)], .18),
] if (GATE11 or GATE12) else [
    ("L_outer", [(-0.78,-0.50,3.56),(-0.67,-0.83,3.34),(-0.76,-0.78,3.23)], .20),
    ("L_inner", [(-0.44,-0.67,3.67),(-0.32,-0.91,3.48),(-0.43,-0.87,3.32)], .17),
    ("Centre", [(0,-0.73,3.73),(0.03,-0.93,3.57),(0.12,-0.88,3.38)], .16),
    ("R_inner", [(0.39,-0.68,3.68),(0.30,-0.91,3.49),(0.38,-0.87,3.33)], .17),
    ("R_outer", [(0.76,-0.51,3.55),(0.66,-0.84,3.35),(0.76,-0.78,3.24)], .20),
])
for name, pts, width in bang_specs:
    if GATE12 or GATE13 or GATE14:
        continue
    elif GATE11:
        tube_lock("GEO_Bang_"+name, pts, [width*.48,width,width*.62,.012], [.035,.055,.036,.009], hair, hair_front)
    else:
        tube_lock("GEO_Bang_"+name, pts, [width, width*.72, .035], [.13,.105,.025], hair, hair_front)

if GATE12:
    ribbon_lock("GEO_BangRibbon_L", [(-0.62,0.02,3.83),(-0.56,-0.38,3.68),(-0.48,-0.68,3.48),(-0.40,-0.82,3.27)],
                [.13,.24,.20,.012],[.05,.04,.025,.006],hair,hair_front)
    ribbon_lock("GEO_BangRibbon_C", [(-0.08,0.00,3.86),(-0.04,-0.40,3.72),(0.01,-0.70,3.51),(0.08,-0.84,3.30)],
                [.12,.23,.18,.012],[.05,.04,.024,.006],hair,hair_front)
    ribbon_lock("GEO_BangRibbon_R", [(0.50,0.03,3.82),(0.53,-0.37,3.67),(0.57,-0.68,3.47),(0.62,-0.82,3.25)],
                [.13,.24,.19,.012],[.05,.04,.025,.006],hair,hair_front)
    ribbon_lock("GEO_SideBang_R", [(0.82,0.04,3.62),(0.91,-0.28,3.38),(0.94,-0.43,3.02),(0.91,-0.35,2.45)],
                [.11,.18,.14,.015],[.05,.045,.03,.008],hair,hair_front)
if GATE13:
    fringe_shell("GEO_FringeShell",hair,hair_front)
    ribbon_lock("GEO_SideBang_R",[(.84,-.02,3.68),(.94,-.30,3.42),(.98,-.48,3.02),(.92,-.40,2.45)],
                [.10,.16,.13,.012],[.045,.040,.025,.006],hair,hair_front)
if GATE14:
    ribbon_lock("GEO_SideBang_R",[(.81,.02,3.61),(.93,-.24,3.37),(.98,-.43,2.98),(.91,-.36,2.43)],
                [.08,.14,.11,.010],[.035,.032,.022,.005],hair,hair_front)

# Lifted crown tuft gives the silhouette life without entering the face.
tube_lock("GEO_Crown_Tuft", [(-0.10,0.05,3.77),(-0.18,-0.04,4.18),(-0.53,-0.02,4.31)],
          [.14,.12,.025], [.10,.08,.02], hair, hair_front)

# Groundless studio lighting: identical for all views.
world = bpy.context.scene.world
world.color = (0.045, 0.045, 0.045)
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = ((0.42,0.38,0.35,1) if (GATE11 or GATE12 or GATE13 or GATE14) else (0.055,0.055,0.055,1))
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.75 if (GATE11 or GATE12 or GATE13 or GATE14) else 0.55
for name, loc, energy, size in (
    (("Key", (-3,-5,7), 720, 5.0), ("Fill", (4,-4,4.5), 500, 4.5), ("Rim", (2,4,6), 420, 4.0)) if (GATE11 or GATE12 or GATE13 or GATE14) else
    (("Key", (-4,-5,7), 900, 4.0), ("Fill", (4,-3,4.5), 520, 3.5), ("Rim", (2,4,6), 760, 3.0))):
    ld = bpy.data.lights.new(name, "AREA")
    ld.energy, ld.shape, ld.size = energy, "DISK", size
    lo = bpy.data.objects.new(name, ld)
    bpy.context.scene.collection.objects.link(lo)
    lo.location = loc
    lo.rotation_euler = (Vector((0,0,2.7))-Vector(loc)).to_track_quat("-Z","Y").to_euler()

cams = {
    "front": camera("CAM_Front", (0,-8.4,2.75), (0,0,2.70)),
    "three_quarter": camera("CAM_ThreeQuarter", (5.7,-6.3,3.0), (0,0,2.70)),
    "side": camera("CAM_Side", (8.2,0,2.8), (0,0,2.70)),
}

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x, scene.render.resolution_y, scene.render.resolution_percentage = 640, 640, 100
scene.render.image_settings.file_format = "PNG"
scene.render.film_transparent = False
scene.render.image_settings.color_mode = "RGBA"
scene.view_settings.look = "AgX - Medium High Contrast"
scene.render.use_file_extension = True

scene["gate"] = "Gate 1 - head bust only"
scene["visual_target"] = "third-person-adventurer-girl-3d-visual-target-v1.png"
scene["primitive_v3_reused"] = False

blend_path = OUT / f"adventurer-girl-head-{GATE_VERSION}.blend"
bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
for view, cam in cams.items():
    scene.camera = cam
    scene.render.filepath = str(OUT / f"adventurer-girl-head-{GATE_VERSION}-{view}.png")
    bpy.ops.render.render(write_still=True)
print(f"GATE1_OK blend={blend_path} meshes={len(bpy.data.meshes)}")
